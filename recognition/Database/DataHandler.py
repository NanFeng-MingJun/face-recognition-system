import os
#import numpy as np
#from sklearn.preprocessing import normalize
from pymilvus import (
    connections,
    utility,
    FieldSchema, CollectionSchema, DataType,
    Collection, BaseException, ParamError
)
                            

class EmbedHandler:
    def __init__(self):
        self.alias = 'default'
        self.host = os.getenv('MILVUS_HOST')
        self.port = os.getenv('MILVUS_PORT')
        self.client = None
        self.is_loaded = False
        print("Milvus init")
        
        try:
            self.client = connections.connect(self.alias, host=self.host, port=self.port)
            print("Milvus connect")
        except BaseException as error:
            self.client = None
            print("Failed connecting to Milvus {}".format(error))
            
            
    def connect(self, alias='default', host=os.getenv('MILVUS_HOST'), port=os.getenv('MILVUS_PORT')):
        try:
            self.client = connections.connect(alias, host=host, port=port)
            print("Milvus connect function")
            return True
        except BaseException as error:
            self.client = None
            print("Failed connecting to Milvus {}".format(error))
            return False
        
        
    def load_all_collection(self):
        if self.client == None:
            self.connect()
            
        if self.is_loaded == False:   
            collection_list = utility.list_collections()
        
            for i in collection_list:
                collection = Collection(i)
                collection.load()
                
            self.is_loaded = True
            print("Milvus is loaded")
        
        
                
    def create_collection(self, collection_name, partition_name = '_default'):
        #connections.connect("default", host="localhost", port="19530")
        # We're going to create a collection with 3 fields.
        # +-+------------+------------+--------------------+--------------------------------+
        # | | field name | field type | other attributes   |       field description        |
        # +-+------------+------------+--------------------+--------------------------------+
        # |1|    "pk"    |    Int64   |  is_primary=True   |      "primary field"           |
        # | |            |            |   auto_id=False    |                                |
        # +-+------------+------------+--------------------+--------------------------------+
        # |2|"embeddings"| FloatVector|     dim=512        |  "float vector with dim 512"   |
        # +-+------------+------------+--------------------+--------------------------------+
        
        fields = [
            FieldSchema(name="pk", dtype=DataType.INT64, is_primary=True, auto_id=False),
            FieldSchema(name="embeddings", dtype=DataType.FLOAT_VECTOR, dim=512)
        ]
    
        schema = CollectionSchema(fields)
        
        try:
            collection = Collection(collection_name, schema, consistency_level="Strong")
            if partition_name != '_default':
                collection.create_partition(partition_name)
                
            print('Create collection with name: ', collection.name)
            print('Partitions: ', collection.partitions)
            print('Schema', collection.schema)
            collection.load()
        except BaseException as error:
            print("Failed creating collection {}".format(error))
     
        #connections.disconnect(self.alias)
        
        
    def drop_collection(self, collection_name):
        #connections.connect("default", host="localhost", port="19530")
        try:
            utility.drop_collection(collection_name)
        except BaseException as error:
            print("Failed droping collection {}".format(error))
            
        #connections.disconnect(self.alias)
    
    
    # example: insert_Milvus_vector("cs101", [18120506, 18120520,..], [[0.323434, 0.4343444,..], [0.323434, 0.4343444,..]])
    def insert_vector(self, student_id, embeddings, collection_name, partition_name = '_default'):
        #connections.connect("default", host="localhost", port="19530")    
        checker = utility.has_collection(collection_name)
        if checker == False:
            print("No Milvus collection with name: ", collection_name, " exits when you try to insert")
            self.create_collection(collection_name, partition_name)
            #connections.disconnect(self.alias)

        collection = Collection(collection_name)      # Get an existing collection.
    
        entities = [student_id,embeddings]
        
        try:
            
            if not collection.has_partition(partition_name):
                print("try to create partition: ", partition_name, 'in collection: ', collection_name)
                collection.create_partition(partition_name)
            insert_result = collection.insert(entities, partition_name = partition_name)
            #print(collection.partitions)
            #print(collection.num_entities)
            return insert_result
        except BaseException as error:
            print("Failed inserting entities {}".format(error))
        except ParamError as error:
            print("Failed inserting entities {}".format(error))
        
        #connections.disconnect(self.alias)
    

    def get_collection_list(self):
        #connections.connect("default", host="localhost", port="19530")
        a = utility.list_collections()
        #connections.disconnect(self.alias)
        return a
    
    
    # input ids = [18120506, 18120520,..]
    # return [[18120506, [3344, 423434, 13343, ...]], [18120520, [3344, 423434, 13343, ...]]]
    def get_by_id(self, collection_name, ids):
        #connections.connect("default", host="localhost", port="19530")
        checker = utility.has_collection(collection_name)
        if checker == False:
            print("No Milvus collection with name: ", collection_name, " exits")
            connections.disconnect(self.alias)
            return None
        
        collection = Collection(collection_name)
        
        try:
            #collection.load()
            result = []
            #print(collection.num_entities)
        
            for i in range(len(ids)):
                expr = f"pk in [{ids[i]}]"
                temp = collection.query(expr=expr, output_fields=["pk", "embeddings"]) # [{'pk': 18120506, 'embeddings': [3344, 423434, ...]}]
                result.append([temp[0]["pk"], temp[0]["embeddings"]])
            
            #collection.release()
        except BaseException as error:
            print("Failed inserting entities {}".format(error))
        except ParamError as error:
            print("Failed inserting entities {}".format(error))
            
        #connections.disconnect(self.alias)
            
        return result
    
    
    def search_by_id(self, id, embedding, collection_name, partition_name = '_default'):
        #connections.connect("default", host="localhost", port="19530")
        checker = utility.has_collection(collection_name)
        if checker == False:
            print("No Milvus collection with name: ", collection_name, " exits")
            connections.disconnect(self.alias)
            return None
        
        collection = Collection(collection_name)
        result = None
        
        try:
            #collection.load()
            #print(collection.num_entities)

            exp = f"pk == {id}"
            result = collection.search(embedding, "embeddings", {"metric_type": "IP"},1,exp,partition_names=[partition_name],consistency_level="Strong")
            # No result macths given id
            if len(result[0]) == 0:
                return 0, 0
            else:
                return result[0].ids[0], 1 - result[0].distances[0]

            #collection.release()
        except BaseException as error:
            print("Failed search_by_id {}".format(error))
            return -1, -1
        except ParamError as error:
            print("Failed search_by_id {}".format(error))
            return -1, -1
            
        #connections.disconnect(self.alias)
        
        
    def search(self, embedding, collection_name, partition_name = '_default'):
        #connections.connect("default", host="localhost", port="19530")
        checker = utility.has_collection(collection_name)
        if checker == False:
            print("No Milvus collection with name: ", collection_name, " exits")
            connections.disconnect(self.alias)
            return None
        
        collection = Collection(collection_name)
        result = None
        
        try:
            #collection.load()
            #print(collection.num_entities)

            result = collection.search(embedding, "embeddings", {"metric_type": "IP"},1,exp=None,partition_names=[partition_name],consistency_level="Strong")
            # No result macths
            if len(result[0]) == 0:
                return 0, 0
            else:
                return result[0].ids[0], 1 - result[0].distances[0]

            #collection.release()
        except BaseException as error:
            print("Failed search_by_id {}".format(error))
            return -1, -1
        except ParamError as error:
            print("Failed search_by_id {}".format(error))
            return -1, -1
            
        #connections.disconnect(self.alias)
        
#rng = np.random.default_rng(seed=19530)
#emb = rng.random((512))
#emb = normalize([emb])
#print(emb)

#a = EmbedHandler()
#a.load_all_collection()
#a.create_Milvus_collection("cs101")
#print(a.get_collection_list())
#print(a.get_by_id('HCMUS',[18120506]))
#print(a.search_by_id(18120506,emb,"HCMUS","cs101"))
#a.drop_collection("school_a")
#print(a.get_collection_list())