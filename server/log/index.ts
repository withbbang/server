import { Router } from 'express';
import { logIn } from './logIn';
import { logOut } from './logOut';

export const log: Router = Router();

log.use('/in', logIn);
log.use('/out', logOut);
