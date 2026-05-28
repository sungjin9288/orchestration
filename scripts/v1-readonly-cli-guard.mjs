export function requireNoCliArgs(argv, { mode }) {
  const receivedArgs = Array.from(argv || []);

  if (receivedArgs.length === 0) {
    return;
  }

  console.error(
    JSON.stringify(
      {
        ok: false,
        mode,
        error: 'invalid-arguments',
        message: `${mode} does not accept CLI arguments`,
        allowedFlags: [],
        receivedArgs,
      },
      null,
      2,
    ),
  );
  process.exit(2);
}
