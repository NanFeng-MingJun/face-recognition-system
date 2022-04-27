FROM golang:latest
WORKDIR /app

COPY . ./
RUN go mod download
RUN go build main.go

FROM ubuntu:latest
WORKDIR /dist
COPY --from=0 /app/main ./
COPY --from=0 /app/.env ./
EXPOSE 3002
CMD [ "./main" ]