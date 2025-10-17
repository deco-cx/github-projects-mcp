/**
 * TanStack Query hooks for repository and project tracking operations.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "../lib/rpc";

// Repository tracking hooks
export const useTrackedRepositories = (activeOnly = true) => {
  return useQuery({
    queryKey: ["trackedRepositories", activeOnly],
    queryFn: () => client.LIST_TRACKED_REPOSITORIES({ activeOnly }),
  });
};

export const useAddRepository = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { owner: string; name: string }) =>
      client.ADD_TRACKED_REPOSITORY(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trackedRepositories"] });
    },
  });
};

export const useRemoveRepository = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: number; hardDelete?: boolean }) =>
      client.REMOVE_TRACKED_REPOSITORY(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trackedRepositories"] });
    },
  });
};

// Project tracking hooks
export const useTrackedProjects = (activeOnly = true) => {
  return useQuery({
    queryKey: ["trackedProjects", activeOnly],
    queryFn: () => client.LIST_TRACKED_PROJECTS({ activeOnly }),
  });
};

export const useAddProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      projectId: string;
      title: string;
      organizationLogin: string;
    }) => client.ADD_TRACKED_PROJECT(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trackedProjects"] });
    },
  });
};

export const useRemoveProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: number; hardDelete?: boolean }) =>
      client.REMOVE_TRACKED_PROJECT(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trackedProjects"] });
    },
  });
};

// GitHub projects listing (for adding new tracked projects)
export const useGitHubProjects = (organizationLogin?: string) => {
  return useQuery({
    queryKey: ["githubProjects", organizationLogin],
    queryFn: () =>
      client.LIST_GITHUB_PROJECTS({
        organizationLogin: organizationLogin || "",
      }),
    enabled: !!organizationLogin,
  });
};

