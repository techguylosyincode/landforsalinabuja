import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export default async function AdminLandTypes() {
    const supabase = await createClient();
    const { data: types } = await supabase.from("land_types").select("*").order("name");

    async function addType(formData: FormData) {
        "use server";
        const supabase = await createClient();
        const name = formData.get("name") as string;
        const slug = formData.get("slug") as string;

        await supabase.from("land_types").insert({ name, slug });
        revalidatePath("/admin/types");
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Manage Land Types</h1>

            <div className="bg-white p-6 rounded-lg shadow mb-8">
                <h2 className="text-lg font-semibold mb-4">Add New Type</h2>
                <form action={addType} className="flex gap-4">
                    <input
                        name="name"
                        placeholder="Name (e.g. Residential)"
                        className="border p-2 rounded flex-1"
                        required
                    />
                    <input
                        name="slug"
                        placeholder="Slug (e.g. residential)"
                        className="border p-2 rounded flex-1"
                        required
                    />
                    <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                        Add
                    </button>
                </form>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {types?.map((type) => (
                            <tr key={type.id}>
                                <td className="px-6 py-4 whitespace-nowrap">{type.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{type.slug}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                    {new Date(type.created_at).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
