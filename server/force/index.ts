import { Router } from 'express';
import { logOut } from './logOut';

export const force: Router = Router();

force.use('/log-out', logOut);
