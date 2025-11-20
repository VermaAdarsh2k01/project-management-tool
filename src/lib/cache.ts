import {redis} from './redis'

export async function cacheGet( key:string ) {
    const data = await redis.get(key)
    return data ? JSON.parse(data) : null
}

export async function cacheSet( key:string , value: unknown , expiry = 120){
    await redis.set(key , JSON.stringify(value) , "EX" , expiry )
}

export async function cacheDelete( key:string ){
    await redis.del(key)
}