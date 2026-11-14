import {env} from 'cloudflare:workers';
import {roomApi} from '../../../lib/rooms-api';
export const dynamic='force-dynamic';
export function GET(req:Request){return roomApi(env.DB!).GET(req)}
export function POST(req:Request){return roomApi(env.DB!).POST(req)}
