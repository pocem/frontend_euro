import express from "express";
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
console.log(__filename)
const __dirname = dirname(__filename);
console.log(__dirname)
const app = express();
const staticPath = __dirname;
console.log(staticPath)
app.use(express.static(staticPath));

app.get('*', (req, res) => {
  console.log("som tu", path.join(__dirname, 'index.html'))
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app