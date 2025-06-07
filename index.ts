const server = Bun.serve({
    fetch(req, server) {
        const success = server.upgrade(req, {
            data: {
                createdAt: Date.now(),
                channelId: new URL(req.url).searchParams.get("channelId"),
                userId: crypto.randomUUID(),
            }
        });
        if (success) {
            // Bun automatically returns a 101 Switching Protocols
            // if the upgrade succeeds
            return undefined;
        }

        // handle HTTP request normally
        return new Response("Healthy");
    },
    websocket: {
        async message(ws, message) {
            const { channelId, userId } = ws.data
            ws.publish(channelId, `User: ${userId.slice(0, 4)} says: ${message}`);
        },
        open(ws) {
            const { channelId, userId } = ws.data
            ws.subscribe(channelId);
            server.publish(channelId, `User: ${userId.slice(0, 4)} has joined the chat!`);
        },
        close(ws) {
            const { channelId, userId } = ws.data
            ws.unsubscribe(channelId);
            server.publish(channelId, `User: ${userId.slice(0, 4)} has left the chat!`);
        }
    },
});

console.log(`Listening on ${server.hostname}:${server.port}`);