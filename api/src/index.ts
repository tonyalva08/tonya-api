import 'dotenv/config';
import { createApp } from './app';

const PORT = Number(process.env.PORT) || 3001;
const app = createApp();

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`api listening on :${PORT}`);
});
