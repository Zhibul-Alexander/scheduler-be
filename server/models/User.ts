import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true, //обезательное поле
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  posts: [{
    type: mongoose.Schema.Types.ObjectId, // поле с идентификатором для конкретного объекта
    ref: 'Post', // будет ссылаться на эту схему
  }],
},
{timestamps: true}, // добавляем дату, время создания и обновления
);

export default mongoose.model('User', UserSchema);