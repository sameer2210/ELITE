import { toast } from "react-toastify";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../components/common/Button";
import ProjectForm from "../../components/project/ProjectForm";
import {
  useDeleteProject,
  useProject,
  useProjects,
  useUpdateProject,
} from "../../api/projects";
import { useCategories, useTechnologies } from "../../api/lookups";
import { buildProjectFormDefaults, buildProjectPayload } from "../../utils/projectForm";
import { getPrimaryImage, normalizeImageList } from "../../utils/projectImages";
import { ArrowLeft, ExternalLink, Github } from "lucide-react";

const ProjectDetails = () => {
  const [selectedImage, setSelectedImage] = useState(0);

  const { id } = useParams();
  const user = useSelector((state) => state.userReducer.user || null);
  const navigate = useNavigate();

  const {
    data: project,
    isLoading: projectLoading,
    isError: projectError,
  } = useProject(id);

  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  const { data: categories = [] } = useCategories();
  const { data: technologies = [] } = useTechnologies();

  const projectId = project?.id || project?._id;
  const categoryId =
    project?.category?._id || project?.category?.id || project?.category;

  const { data: relatedProjectsData, isLoading: relatedLoading } = useProjects({
    limit: 12,
    filters: categoryId ? { category: categoryId } : undefined,
  });

  const relatedProjects = useMemo(() => {
    const list = Array.isArray(relatedProjectsData) ? relatedProjectsData : [];
    return list.filter((item) => (item.id || item._id) !== projectId).slice(0, 10);
  }, [relatedProjectsData, projectId]);

  const imageList = useMemo(() => {
    if (!project) return [];
    return normalizeImageList(project.image, project.images);
  }, [project]);

  const techStack = useMemo(() => {
    if (!Array.isArray(project?.technologies)) return [];
    return project.technologies
      .map((tech) => tech?.name || tech?.title || tech)
      .filter(Boolean);
  }, [project?.technologies]);

  const canEdit = useMemo(() => {
    if (!user || !project) return false;
    if (user.isAdmin) return true;
    if (user.role !== "developer") return false;
    const ownerId = project.developerId?._id || project.developerId;
    const userId = user.id || user._id;
    return ownerId && userId && ownerId.toString() === userId.toString();
  }, [user, project]);

  const isBusy = projectLoading || updateProject.isPending || deleteProject.isPending;
  const formDefaults = useMemo(
    () => buildProjectFormDefaults(project),
    [project]
  );

  const handleUpdate = async (data) => {
    if (isBusy || !projectId) return;
    try {
      const payload = buildProjectPayload(data);
      await updateProject.mutateAsync({ id: projectId, payload });
      toast.success("Project updated!");
    } catch (error) {
      console.log("Error updating project:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update project."
      );
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    if (isBusy || !projectId) return;
    try {
      await deleteProject.mutateAsync(projectId);
      toast.success("Project deleted!");
      navigate("/projects");
    } catch (error) {
      console.log("Error deleting project:", error);
      toast.error("Failed to delete project.");
    }
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          {projectLoading ? (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading project...</p>
            </>
          ) : (
            <>
              <p className="text-gray-700 font-medium">
                {projectError ? "Project not found." : "Project unavailable."}
              </p>
              <Button onClick={() => navigate("/projects")} className="mt-4">
                Back to Projects
              </Button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 ">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow p-6 relative">
              {isBusy && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
                </div>
              )}
              {/* Project Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-gray-800">{project.title}</h1>
                  <Button
                    onClick={() => navigate("/projects")}
                    disabled={isBusy}
                  ><ArrowLeft className="w-4 h-4" /> Back
                  </Button>
                </div>
                <p className="text-gray-600 mt-1">
                  {project.category?.name || project.category || "Uncategorized"}
                </p>
                {project.developerId?.name && (
                  <p className="text-sm text-gray-500 mt-1">
                    By {project.developerId.name}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Project Images */}
                <div>
                  <div className="bg-gray-100 rounded-lg p-4">
                      <img
                        src={
                          imageList[selectedImage] ||
                          "https://via.placeholder.com/400"
                        }
                        alt={project.title}
                        className="w-full h-80 object-cover rounded"
                        onError={(e) => (e.target.src = "https://via.placeholder.com/400")}
                      />
                  </div>
                  {imageList.length > 1 && (
                    <div className="flex gap-2 mt-2">
                      {imageList.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(index)}
                          className={`w-12 h-12 rounded border-2 ${selectedImage === index ? "border-blue-500" : "border-gray-200"}`}
                          disabled={isBusy}
                        >
                          <img src={image} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Project Details */}
                <div className="space-y-4">
                  <p className="text-gray-700">{project.description || "No description."}</p>

                  {techStack.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600">Tech Stack</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {techStack.map((tech) => (
                          <span
                            key={tech}
                            className="text-xs uppercase tracking-wide px-2 py-1 rounded-full bg-gray-100 text-gray-600"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 pt-4 border-t border-gray-200">
                    {project.liveDemo && (
                      <a
                        href={project.liveDemo}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="w-4 h-4" /> Live Demo
                      </a>
                    )}
                    {project.githubRepo && (
                      <a
                        href={project.githubRepo}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
                      >
                        <Github className="w-4 h-4" /> GitHub Repository
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Admin Edit Section */}
              {canEdit && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h2 className="text-lg font-bold text-gray-800 mb-4">Edit Project</h2>
                  <ProjectForm
                    isEdit={true}
                    defaultValues={formDefaults}
                    onSubmit={handleUpdate}
                    onDelete={handleDelete}
                    loading={isBusy}
                    categories={categories}
                    technologies={technologies}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Related Projects */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">Related Projects</h3>
                <Button
                  onClick={() => navigate("/projects")}
                  className="text-sm"
                  disabled={isBusy}
                >
                  View All
                </Button>
              </div>
              <div className="space-y-4">
                {relatedLoading && (
                  <p className="text-sm text-gray-500 text-center">
                    Loading related projects...
                  </p>
                )}
                {!relatedLoading &&
                  relatedProjects.map((item) => (
                    <div
                      key={item.id || item._id}
                      onClick={() =>
                        navigate(`/projects/${item.id || item._id}`)
                      }
                      className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                    >
                      <img
                        src={
                          getPrimaryImage(item?.image, item?.images) ||
                          "https://via.placeholder.com/50"
                        }
                        alt={item.title}
                        className="w-12 h-12 rounded object-cover"
                        onError={(e) =>
                          (e.target.src = "https://via.placeholder.com/50")
                        }
                      />
                      <div>
                        <h4 className="text-sm font-medium text-gray-800">
                          {item.title}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {item.category?.name || item.category || "Uncategorized"}
                        </p>
                      </div>
                    </div>
                  ))}
                {!relatedLoading && relatedProjects.length === 0 && (
                  <p className="text-sm text-gray-500 text-center">
                    No related projects
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
