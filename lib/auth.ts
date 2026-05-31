export type CurrentUser = {
  id: string;
  name: string;
  email: string;
};

export async function getCurrentUser(): Promise<CurrentUser> {
  return {
    id: "dev-user",
    name: "Dev User",
    email: "dev@pith.local"
  };
}
