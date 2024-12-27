const { kafka } = require('./client');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

async function init() {
    const producer = kafka.producer();

    console.log('Connecting producer...');
    await producer.connect();
    console.log('Producer connected successfully.');

    rl.setPrompt('Enter rider name and location (e.g., "John North") or type "exit" to quit:\n> ');
    rl.prompt();

    rl.on('line', async function (line) {
        if (line.toLowerCase() === 'exit') {
            console.log('Exiting...');
            rl.close();
            return;
        }

        const [riderName, location] = line.split(' ');

        if (!riderName || !location) {
            console.log('Invalid input. Please enter in the format "RiderName Location".');
            rl.prompt();
            return;
        }

        try {
            const partition = location.toLowerCase() === 'north' ? 0 : 1; // Default partitions: 0 for "North", 1 otherwise
            console.log(`Sending data to partition ${partition}...`);
            await producer.send({
                topic: 'rider-updates',
                messages: [
                    {
                        partition: partition,
                        key: 'location-update',
                        value: JSON.stringify({ name: riderName, loc: location }),
                    },
                ],
            });
            console.log('Message sent successfully.');
        } catch (error) {
            console.error('Error sending message:', error);
        }

        rl.prompt();
    }).on('close', async () => {
        console.log('Disconnecting producer...');
        await producer.disconnect();
        console.log('Producer disconnected. Goodbye!');
        process.exit(0);
    });
}

init().catch(console.error);
