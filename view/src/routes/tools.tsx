import { createRoute, type RootRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { client } from "../lib/rpc";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../components/ui/collapsible";
import { ChevronDown, Search, RefreshCw } from "lucide-react";

function ToolsInspectorComponent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { data: toolsData, isLoading } = useQuery({
    queryKey: ["toolMetadata", selectedCategory],
    queryFn: () =>
      client.GET_TOOL_METADATA({
        category: selectedCategory as any,
      }),
  });

  const filteredTools = toolsData?.tools.filter(
    (tool) =>
      tool.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = ["all", "projects", "issues", "tracking", "metadata", "user"];

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      projects: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      issues: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      tracking:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      metadata:
        "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      user: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    };
    return colors[category] || colors.user;
  };

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-4">Tools Inspector</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Explore all available MCP tools, their descriptions, and input/output schemas.
      </p>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                selectedCategory === category
                  ? "bg-primary text-primary-foreground"
                  : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tools List */}
      {isLoading ? (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto" />
          <p className="text-gray-500 mt-4">Loading tools...</p>
        </div>
      ) : filteredTools && filteredTools.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No tools found matching your search.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTools?.map((tool) => (
            <Collapsible key={tool.id}>
              <div className="border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900">
                <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono font-semibold text-lg">
                        {tool.id}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                          tool.category
                        )}`}
                      >
                        {tool.category}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      {tool.description}
                    </p>
                  </div>
                  <ChevronDown className="w-5 h-5 text-gray-400 transition-transform ui-open:rotate-180" />
                </CollapsibleTrigger>

                <CollapsibleContent className="border-t border-gray-200 dark:border-gray-800">
                  <div className="p-4 space-y-4">
                    {/* Input Schema */}
                    <div>
                      <h4 className="font-semibold mb-2 text-sm text-gray-700 dark:text-gray-300">
                        Input Schema
                      </h4>
                      <pre className="bg-gray-50 dark:bg-gray-950 p-4 rounded-lg overflow-x-auto text-xs">
                        {JSON.stringify(tool.inputSchema, null, 2)}
                      </pre>
                    </div>

                    {/* Output Schema */}
                    <div>
                      <h4 className="font-semibold mb-2 text-sm text-gray-700 dark:text-gray-300">
                        Output Schema
                      </h4>
                      <pre className="bg-gray-50 dark:bg-gray-950 p-4 rounded-lg overflow-x-auto text-xs">
                        {JSON.stringify(tool.outputSchema, null, 2)}
                      </pre>
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          ))}
        </div>
      )}

      {/* Summary */}
      {!isLoading && filteredTools && (
        <div className="mt-8 text-center text-gray-500">
          Showing {filteredTools.length} tool{filteredTools.length !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}

export default (parentRoute: RootRoute) =>
  createRoute({
    path: "/tools",
    component: ToolsInspectorComponent,
    getParentRoute: () => parentRoute,
  });

