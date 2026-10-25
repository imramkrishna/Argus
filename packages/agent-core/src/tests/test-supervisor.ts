import { supervisor } from "../agents/supervisor";

const out = await supervisor.invoke({
  messages: [
    {
      role: "user",
      content: "Should we migrate our job queue from Redis to Postgres?",
    },
  ],
});

const lastMessage = out.messages[out.messages.length - 1];
console.log("\n✅ Supervisor Final Report:\n");
console.log(lastMessage?.content);
