type WebSocketData = {
    createdAt: number;
    channelId: string;
    userId: string;
};

const server = Bun.serve({
    fetch(req, server) {
        const success = server.upgrade(req, {
            data: {
                createdAt: Date.now(),
                channelId: new URL(req.url).searchParams.get("channelId"),
                userId: crypto.randomUUID(),
            }
        });

        return success ? undefined : new Response("Healthy");
    },
    websocket: {
        async message(ws, message) {
            const { channelId, userId } = ws.data as WebSocketData;
            ws.publish(channelId, `User: ${userId.slice(0, 4)} says: ${message}`);
        },
        open(ws) {
            const { channelId, userId } = ws.data as WebSocketData;
            ws.subscribe(channelId);
            server.publish(channelId, `User: ${userId.slice(0, 4)} has joined the chat!`);
        },
        close(ws) {
            const { channelId, userId } = ws.data as WebSocketData;
            ws.unsubscribe(channelId);
            server.publish(channelId, `User: ${userId.slice(0, 4)} has left the chat!`);
        }
    },
});

console.log(`Listening on ${server.hostname}:${server.port}`);