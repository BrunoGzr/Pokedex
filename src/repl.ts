import type { State } from "./state.js";

export function cleanInput(input: string): string[] {
  return input
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 0);
}

export function startREPL(state: State): void {
  const rl = state.readline;
  let queue: Promise<void> = Promise.resolve();

  rl.prompt();

  rl.on("line", (line) => {
    queue = queue.then(async () => {
      const words = cleanInput(line);
      if (words.length === 0) {
        rl.prompt();
        return;
      }

      const commandName = words[0];
      const command = state.commands[commandName];

      if (!command) {
        console.log("Unknown command");
        rl.prompt();
        return;
      }

      try {
        await command.callback(state, ...words.slice(1));
      } catch (error) {
        console.log(error);
      }

      rl.prompt();
    });
  });
}
