export const printBin = async (buf: Buffer, host: string): Promise<string> => {
  const result = await (new Promise<void>((resolve) => setTimeout(resolve, 1000)));
  return 'success';
};
