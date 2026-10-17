import ProfileView from "@/components/ProfileView";

export default async function UserPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  return <ProfileView username={decodeURIComponent(username)} />;
}
