import express from 'express';

const app = express();

const PORT = 3005;

async function init() {
  try {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.log(err);
  }
}

init().catch(console.error);