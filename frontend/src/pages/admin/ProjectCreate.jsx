import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft } from "lucide-react";
import Button from "../../components/common/Button";
import ProjectForm from "../../components/project/ProjectForm";
import { useCreateProject } from "../../api/projects";
import { useCategories, useTechnologies } from "../../api/lookups";
import { buildProjectPayload } from "../../utils/projectForm";

const ProjectCreate = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.userReducer || {});
  const { mutateAsync: createProject, isPending } = useCreateProject();
  const { data: categories = [] } = useCategories();
  const { data: technologies = [] } = useTechnologies();

  const defaultValues = useMemo(
    () => ({
      image: "",
      images: [""],
      title: "",
      description: "",
      category: "",
      technologies: [],
      liveDemo: "",
      githubRepo: "",
    }),
    []
  );

  const canCreate = user?.isAdmin || user?.role === "developer";

  if (!canCreate) {
    toast.error("You must be a developer or admin to submit projects");
    setTimeout(() => navigate("/"), 300);
    return null;
  }

  const handleCreate = async (data) => {
    if (isPending) return;

    try {
      const payload = buildProjectPayload(data);
      await createProject(payload);
      toast.success("Project created successfully!");
      navigate("/projects");
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error(
        error.message || "Failed to create project. Please try again."
      );
    }
  };

  return (
    <section className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Submit New Project
            </h1>
            <Button onClick={() => navigate("/projects")} className="text-sm">
              <ArrowLeft className="w-4 h-4" /> Back to Projects
            </Button>
          </div>
          <p className="text-gray-600 text-sm sm:text-base mt-2">
            Share your latest work with the community.
          </p>
        </header>

        {/* Form Card */}
        <div>
          <ProjectForm
            defaultValues={defaultValues}
            onSubmit={handleCreate}
            isEdit={false}
            loading={isPending}
            categories={categories}
            technologies={technologies}
            seedable
          />
        </div>
      </div>
    </section>
  );
};

export default ProjectCreate;
