import { auth } from "@clerk/nextjs/server";
import {redirect} from "next/navigation";
import { SyncUser } from "@/app/actions/User";

export default async function Home() {

    const { userId } =  await auth();

    if( !userId ){
        redirect("/sign-in")
    }

    try{
        await SyncUser();
    }catch(err) {
        console.error("Error syncing user:", err);
    }
    
    return (
        <div className="bg-black h-screen w-screen text-white p-8">
        <div className="flex justify-between items-center mb-8">
            
        </div>
        
        <div className="max-w-2xl">
            <h2 className="text-xl mb-4">Welcome!</h2>
            <p className="text-gray-300 mb-4">
            When you sign in or sign up, your user data will automatically be synced with our database.
            </p>
            <p className="text-gray-300">
            The UserSync component runs in the background and ensures your user record exists in our database.
            </p>
        </div>
        </div>
    );
}