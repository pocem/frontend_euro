import express from "express";
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
console.log(__filename)
const __dirname = dirname(__filename);
console.log(__dirname)
const app = express();
const staticPath = path.resolve(__dirname, '..', 'dist');
console.log(staticPath)
app.use(express.static(staticPath));

app.get('*', (req, res) => {
  res.sendFile(path.resolve(staticPath, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app