import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { GlobalRole, UserStatus } from "@allmyworks/shared";
import { api } from "../lib/api";
import type { User } from "../types/api";

export function useUsers(filters: { status?: UserStatus } = {}) {
  return useQuery({
    queryKey: ["users", filters],
    queryFn: async () => (await api.get<User[]>("/users", { params: filters })).data,
  });
}

function invalidateUsers(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ["users"] });
}

export interface CreateUserInput {
  nome: string;
  email: string;
  papel: GlobalRole;
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateUserInput) => (await api.post<User>("/users", input)).data,
    onSuccess: () => invalidateUsers(qc),
  });
}

export function useUpdateUser(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<CreateUserInput>) => (await api.patch<User>(`/users/${id}`, input)).data,
    onSuccess: () => invalidateUsers(qc),
  });
}

export function useUpdateUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: UserStatus }) =>
      (await api.patch<User>(`/users/${id}/status`, { status })).data,
    onSuccess: () => invalidateUsers(qc),
  });
}

export function useResetPassword() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.post<User>(`/users/${id}/reset-password`)).data,
    onSuccess: () => invalidateUsers(qc),
  });
}
