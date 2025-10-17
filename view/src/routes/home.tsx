import { createRoute, type RootRoute, Link } from "@tanstack/react-router";
import { Bookmark, Code2, GitBranch, Lightbulb, Rocket, FolderGit2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserButton } from "@/components/user-button";

function FeatureCard({
  icon: Icon,
  title,
  description,
  link,
}: {
  icon: any;
  title: string;
  description: string;
  link?: string;
}) {
  const content = (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-blue-500 transition-all duration-200 hover:shadow-lg h-full flex flex-col">
      <div className="flex items-start gap-4 mb-3">
        <div className="p-2 bg-blue-500/10 rounded-lg">
          <Icon className="w-6 h-6 text-blue-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
          <p className="text-sm text-slate-400">{description}</p>
        </div>
      </div>
    </div>
  );

  if (link) {
    return (
      <Link to={link} className="block h-full">
        {content}
      </Link>
    );
  }

  return content;
}

function HomePage() {
  return (
    <div className="bg-slate-900 min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <GitBranch className="w-10 h-10 text-blue-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">
                GitHub Projects Manager
              </h1>
              <p className="text-sm text-slate-400">
                AI-powered GitHub Projects V2 and Issues management
              </p>
            </div>
          </div>

          <UserButton />
        </div>

        {/* Hero Section */}
        <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-500/30 rounded-xl p-8 mb-12">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <Rocket className="w-8 h-8 text-blue-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-3">
                Automate Your GitHub Workflow with AI
              </h2>
              <p className="text-slate-300 mb-4 max-w-2xl">
                This MCP server provides comprehensive GitHub Projects V2 and Issues
                management capabilities. Track repositories and projects, create and
                update issues, manage labels and assignees, and let AI handle your
                workflow automation.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/projects">
                  <Button className="bg-blue-600 hover:bg-blue-500">
                    <FolderGit2 className="w-4 h-4 mr-2" />
                    Browse Projects
                  </Button>
                </Link>
                <Link to="/issues">
                  <Button className="bg-green-600 hover:bg-green-500">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Browse Issues
                  </Button>
                </Link>
                <Link to="/tracking">
                  <Button
                    variant="outline"
                    className="border-slate-600 hover:bg-slate-800"
                  >
                    <Bookmark className="w-4 h-4 mr-2" />
                    Tracking
                  </Button>
                </Link>
                <Link to="/tools">
                  <Button
                    variant="outline"
                    className="border-slate-600 hover:bg-slate-800"
                  >
                    <Code2 className="w-4 h-4 mr-2" />
                    Tools
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <FeatureCard
            icon={FolderGit2}
            title="Projects Browser"
            description="Browse and explore GitHub Projects V2 from any organization. Real-time demonstration of project listing and details."
            link="/projects"
          />

          <FeatureCard
            icon={AlertCircle}
            title="Issues Browser"
            description="Browse issues from any repository with full details, comments, and labels. See the Issues API in action."
            link="/issues"
          />

          <FeatureCard
            icon={Bookmark}
            title="Tracking Manager"
            description="Configure which repositories and projects to monitor. Add or remove tracked items and keep your focus on what matters."
            link="/tracking"
          />

          <FeatureCard
            icon={Code2}
            title="Tools Inspector"
            description="Explore all available MCP tools with their descriptions and schemas. Perfect for understanding what AI can do."
            link="/tools"
          />

          <FeatureCard
            icon={GitBranch}
            title="Projects V2 Management"
            description="Full CRUD operations for GitHub Projects V2. Create, update, list, and manage project items programmatically."
          />

          <FeatureCard
            icon={Lightbulb}
            title="Complete Issues Control"
            description="Manage issues end-to-end: create, update, close, add comments, assign users, and manage labels."
          />
        </div>

        {/* Quick Stats */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Available MCP Tools
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-1">7</div>
              <div className="text-sm text-slate-400">Project Tools</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-1">11</div>
              <div className="text-sm text-slate-400">Issue Tools</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-1">6</div>
              <div className="text-sm text-slate-400">Tracking Tools</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-400 mb-1">24+</div>
              <div className="text-sm text-slate-400">Total Operations</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-slate-700">
          <p className="text-xs text-slate-500 text-center">
            Built with Deco MCP • GraphQL API • Type-safe Tools • Database Tracking
          </p>
        </div>
      </div>
    </div>
  );
}

export default (parentRoute: RootRoute) =>
  createRoute({
    path: "/",
    component: HomePage,
    getParentRoute: () => parentRoute,
  });
