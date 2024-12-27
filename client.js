const { Kafka } = require('kafkajs');

const kafka = new Kafka({
    clientId: "my-app",
    brokers: ["10.0.0.104:9092"], 
});

exports.kafka = kafka;
