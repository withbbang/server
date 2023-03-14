import { Router } from 'express';
import { signUp } from './signUp';
import { signOut } from './signOut';

export const sign: Router = Router();

sign.use('/up', signOut);
sign.use('/up', signUp);
