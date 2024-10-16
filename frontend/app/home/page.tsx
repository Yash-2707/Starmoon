import { createUser, doesUserExist, getUserById } from "@/db/users";
import { getAllToys } from "@/db/toys";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import Playground from "../components/playground/PlaygroundComponent";
import { defaultPersonalityId, defaultToyId } from "@/lib/data";
import { getAllPersonalities } from "@/db/personalities";

export default async function Home() {
    const supabase = createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    if (user) {
        const userExists = await doesUserExist(supabase, user);
        if (!userExists) {
            // Create user if they don't exist
            await createUser(supabase, user, {
                toy_id: user?.user_metadata?.toy_id ?? defaultToyId,
                personality_id:
                    user?.user_metadata?.personality_id ?? defaultPersonalityId,
            });
            redirect("/onboard");
        }
    }

    const dbUser = await getUserById(supabase, user!.id);
    const allToys = await getAllToys(supabase);
    const allPersonalities = await getAllPersonalities(supabase);

    return (
        <div>
            {dbUser && (
                <Playground
                    allPersonalities={allPersonalities}
                    selectedUser={dbUser}
                    allToys={allToys}
                />
            )}
        </div>
    );
}
