FROM golang:latest
WORKDIR /app

COPY . ./
RUN go mod download
RUN go build main.go

FROM ubuntu:latest
RUN apt update
RUN apt install -y ca-certificates
RUN update-ca-certificates

WORKDIR /dist
COPY --from=0 /app/main ./
COPY --from=0 /app/.env ./
COPY --from=0 /app/serviceAccountKey.json ./
EXPOSE 3003
CMD [ "./main" ]
