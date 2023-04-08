import {Request, Response} from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {v4 as uuidv4} from 'uuid';

import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

import User from '../models/User.js';

interface MailOptions {
    from: string;
    to: string;
    subject: string;
    text?: string;
    html?: string;
}

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const {email, password} = req.body;

    const user = await User.findOne({email});
    if (user) {
      res.status(400).json({message: 'Username is already taken'});
      return;
    }

    const salt: string = bcrypt.genSaltSync(10); // генерируем соль для хэширования
    const hash: string = bcrypt.hashSync(password, salt); // хэшируем пароль

    const newUser = new User({
      email,
      password: hash,
    });
    await newUser.save();

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

    const user = await User.findOne({email});
    if (!user) {
      res.status(400).json({message: 'User not found'});
      return;
    }

    const isPasswordCorrect: boolean = await bcrypt.compare(password, user.password);
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

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const {email} = req.body;

    const user = await User.findOne({email});
    if (!user) {
      res.status(400).json({message: 'User not found'});
      return;
    }

    const resetToken = uuidv4();
    user.resetPasswordToken = resetToken;
    await user.save();

    // const transporter = nodemailer.createTransport({
    //   host: 1025,
    //   port: process.env.EMAIL_PORT,
    //   secure: false,
    //   auth: {
    //     user: process.env.EMAIL_LOGIN,
    //     pass: process.env.EMAIL_PASSWORD,
    //   },
    // });
    //
    // const resetPasswordUrl = `${process.env.SERVER_PROTO}://${process.env.SERVER_URL}:${process.env.PORT}/forgot-password/${resetToken}`;
    // const message: MailOptions = {
    //   from: 'Scheduler <scheduler@gmail.com>',
    //   to: user.email,
    //   subject: 'Reset password',
    //   html: `Hello,<br><br>You requested a password reset.<br><br>Use the link below to reset your password:<br><br><a href="${resetPasswordUrl}">${resetPasswordUrl}</a>`,
    // };
    //
    // await transporter.sendMail(message);


    const transporter: Mail = nodemailer.createTransport({
      port: 1025,
      ignoreTLS: true,
    });

    const resetPasswordUrl = `${process.env.SERVER_PROTO}://${process.env.SERVER_URL}:${process.env.PORT}/forgot-password/${resetToken}`;
    const message: MailOptions = {
      from: 'Scheduler <scheduler@gmail.com>',
      to: user.email,
      subject: 'Reset password',
      html: `Hello,<br><br>You requested a password reset.<br><br>Use the link below to reset your password:<br><br><a href="${resetPasswordUrl}">${resetPasswordUrl}</a>`,
    };

    await transporter.sendMail(message);

    res.json({
      message: 'Password reset email sent',
    });
  } catch (e) {
    res.status(400).send(e);
  }
};