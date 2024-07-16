import express from 'express';
import { getSubscriberStatus, handleSubscribe, handleUnsubscribe } from '../controllers/mobitelController.js';


const mobitelRoute = express.Router();

mobitelRoute.post('/getSubscriberStatus', getSubscriberStatus);
mobitelRoute.post('/subscribe', handleSubscribe);
mobitelRoute.post('/unsubscribe', handleUnsubscribe);

export default mobitelRoute;