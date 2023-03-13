import {Request, Response} from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import User from '../models/User.js';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const {email, password} = req.body;

    const user = await User.findOne({email}); // ищим полученный email в базе данных
    if (user) {
      res.status(400).json({message: 'Username is already taken'});
      return;
    }

    const salt: string = bcrypt.genSaltSync(10); // генерируем соль для хэширования
    const hash: string = bcrypt.hashSync(password, salt); // хэшируем пароль

    const newUser = new User({ // добавляем нового пользователя в базу данных
      email,
      password: hash, // сохраняем хэш пароля в базу данных
    });

    await newUser.save(); // сохраняем пользователя в базу данных

    res.json({
      newUser,
      message: 'User created successfully',
    });

  } catch (e) {
    res.status(400).send(e);
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const {email, password} = req.body;

    const user = await User.findOne({email}); // ищем пользователя в базе данных
    if (!user) {
      res.status(400).json({message: 'User not found'});
      return;
    }

    const isPasswordCorrect: boolean = await bcrypt.compare(password, user.password); // проверяем полученный пароль и пароль пользователя из базы данных
    if (!isPasswordCorrect) {
      res.status(400).json({message: 'Incorrect password'});
      return;
    }

    const token: string = jwt.sign(
      {id: user._id}, // добавляем идентификатор пользователя в токен
      process.env.JWT_SECRET || '', // создаем секретный токен
      {expiresIn: '30d'}, // устанавливаем время действия токена
    );

    res.json({
      token,
      user,
      message: 'User logged in successfully',
    });

  } catch (e) {
    res.status(400).send(e);
  }
};
