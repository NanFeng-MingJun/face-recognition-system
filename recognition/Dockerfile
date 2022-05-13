FROM python:3.8.10

WORKDIR /app
COPY . .

RUN pip install -r requirement.txt
RUN apt-get update && apt-get install -y libgl1

ENV ENV_PROD_FILE .env.prod
EXPOSE 3000

CMD [ "bash", "run.sh" ]
