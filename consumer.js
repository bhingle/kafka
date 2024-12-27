const { kafka } = require('./client');
const group = process.argv[2];

async function init() {
    if (!group) {
        console.error("Error: Please provide a group ID as an argument.");
        console.log("Usage: node consumer.js <group-id>");
        process.exit(1);
    }

    const consumer = kafka.consumer({ groupId: group });

    try {
        console.log("Connecting consumer...");
        await consumer.connect();
        console.log("Consumer connected successfully.");

        console.log(`Subscribing to topic "rider-updates" for group "${group}"...`);
        await consumer.subscribe({ topic: "rider-updates", fromBeginning: true });

        console.log("Running consumer...");
        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                console.log(`[${group}]: [${topic}] PART: ${partition} - ${message.value.toString()}`);
            },
        });

        // Gracefully handle shutdown
        process.on("SIGINT", async () => {
            console.log("\nDisconnecting consumer (SIGINT)... Please wait.");
            await consumer.disconnect();
            console.log("Consumer disconnected. Exiting...");
            process.exit(0);
        });

        process.on("SIGTERM", async () => {
            console.log("\nDisconnecting consumer (SIGTERM)... Please wait.");
            await consumer.disconnect();
            console.log("Consumer disconnected. Exiting...");
            process.exit(0);
        });

    } catch (error) {
        console.error("An error occurred:", error.message);
        process.exit(1);
    }
}

init().catch((error) => {
    console.error("Failed to initialize consumer:", error.message);
    process.exit(1);
});
