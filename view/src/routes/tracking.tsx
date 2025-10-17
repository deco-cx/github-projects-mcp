import { createRoute, type RootRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  useTrackedRepositories,
  useAddRepository,
  useRemoveRepository,
  useTrackedProjects,
  useAddProject,
  useRemoveProject,
  useGitHubProjects,
} from "../hooks/useTracking";
import { Button } from "../components/ui/button";
import { Trash2, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";

function TrackingManagerComponent() {
  const [repoOwner, setRepoOwner] = useState("");
  const [repoName, setRepoName] = useState("");
  const [orgLogin, setOrgLogin] = useState("");
  const [selectedProject, setSelectedProject] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const { data: repositories, isLoading: reposLoading } =
    useTrackedRepositories();
  const { data: projects, isLoading: projectsLoading } = useTrackedProjects();
  const { data: githubProjects } = useGitHubProjects(orgLogin);

  const addRepoMutation = useAddRepository();
  const removeRepoMutation = useRemoveRepository();
  const addProjectMutation = useAddProject();
  const removeProjectMutation = useRemoveProject();

  const handleAddRepository = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoOwner || !repoName) {
      toast.error("Please enter both owner and repository name");
      return;
    }

    try {
      await addRepoMutation.mutateAsync({
        owner: repoOwner,
        name: repoName,
      });
      toast.success(`Repository ${repoOwner}/${repoName} added`);
      setRepoOwner("");
      setRepoName("");
    } catch (error: any) {
      toast.error(error.message || "Failed to add repository");
    }
  };

  const handleRemoveRepository = async (id: number, owner: string, name: string) => {
    if (!confirm(`Remove ${owner}/${name} from tracking?`)) return;

    try {
      await removeRepoMutation.mutateAsync({ id });
      toast.success("Repository removed");
    } catch (error: any) {
      toast.error(error.message || "Failed to remove repository");
    }
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !orgLogin) {
      toast.error("Please select an organization and project");
      return;
    }

    try {
      await addProjectMutation.mutateAsync({
        projectId: selectedProject.id,
        title: selectedProject.title,
        organizationLogin: orgLogin,
      });
      toast.success(`Project ${selectedProject.title} added`);
      setSelectedProject(null);
      setOrgLogin("");
    } catch (error: any) {
      toast.error(error.message || "Failed to add project");
    }
  };

  const handleRemoveProject = async (id: number, title: string) => {
    if (!confirm(`Remove ${title} from tracking?`)) return;

    try {
      await removeProjectMutation.mutateAsync({ id });
      toast.success("Project removed");
    } catch (error: any) {
      toast.error(error.message || "Failed to remove project");
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Tracking Manager</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Manage repositories and projects that you want to monitor with AI automation.
      </p>

      {/* Repositories Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Tracked Repositories</h2>

        {/* Add Repository Form */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium mb-4">Add Repository</h3>
          <form onSubmit={handleAddRepository} className="flex gap-3">
            <input
              type="text"
              placeholder="Owner (e.g., deco-cx)"
              value={repoOwner}
              onChange={(e) => setRepoOwner(e.target.value)}
              className="flex-1 px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
            />
            <input
              type="text"
              placeholder="Repository name"
              value={repoName}
              onChange={(e) => setRepoName(e.target.value)}
              className="flex-1 px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
            />
            <Button
              type="submit"
              disabled={addRepoMutation.isPending}
              className="whitespace-nowrap"
            >
              {addRepoMutation.isPending ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Repository
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Repositories List */}
        {reposLoading ? (
          <div className="text-center py-8">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto" />
          </div>
        ) : !repositories || repositories?.repositories.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-8 text-center">
            <p className="text-gray-500 mb-2">No repositories tracked yet.</p>
            <p className="text-sm text-gray-400">
              Add repositories above to start monitoring them with AI automation.
            </p>
            <p className="text-xs text-gray-400 mt-4">
              💡 Example: Try adding <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">deco-cx/deco</code>
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {repositories?.repositories.map((repo) => (
              <div
                key={repo.id}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
              >
                <div>
                  <div className="font-medium">
                    {repo.owner}/{repo.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    Added {new Date(repo.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemoveRepository(repo.id, repo.owner, repo.name)}
                  disabled={removeRepoMutation.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Projects Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Tracked Projects</h2>

        {/* Add Project Form */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium mb-4">Add Project</h3>
          <form onSubmit={handleAddProject} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Organization login (e.g., deco-cx)"
                value={orgLogin}
                onChange={(e) => setOrgLogin(e.target.value)}
                className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
              />
            </div>

            {orgLogin && githubProjects?.projects && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Select Project
                </label>
                <select
                  value={selectedProject?.id || ""}
                  onChange={(e) => {
                    const project = githubProjects.projects.find(
                      (p) => p.id === e.target.value
                    );
                    setSelectedProject(
                      project ? { id: project.id, title: project.title } : null
                    );
                  }}
                  className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                >
                  <option value="">-- Select a project --</option>
                  {githubProjects.projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <Button
              type="submit"
              disabled={
                addProjectMutation.isPending || !selectedProject || !orgLogin
              }
              className="w-full"
            >
              {addProjectMutation.isPending ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Project
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Projects List */}
        {projectsLoading ? (
          <div className="text-center py-8">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto" />
          </div>
        ) : !projects || projects?.projects.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-8 text-center">
            <p className="text-gray-500 mb-2">No projects tracked yet.</p>
            <p className="text-sm text-gray-400">
              Add projects above to start monitoring them with AI automation.
            </p>
            <p className="text-xs text-gray-400 mt-4">
              💡 First, enter your organization login to fetch available projects.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {projects?.projects.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
              >
                <div>
                  <div className="font-medium">{project.title}</div>
                  <div className="text-sm text-gray-500">
                    {project.organizationLogin} •{" "}
                    {new Date(project.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemoveProject(project.id, project.title)}
                  disabled={removeProjectMutation.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default (parentRoute: RootRoute) =>
  createRoute({
    path: "/tracking",
    component: TrackingManagerComponent,
    getParentRoute: () => parentRoute,
  });

