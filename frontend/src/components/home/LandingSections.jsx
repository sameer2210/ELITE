import DeveloperCategories from "./DeveloperCategories";
import FeaturedProject from "./FeaturedProject";
import TrendingProjects from "./TrendingProjects";
import TechnologyExplorer from "./TechnologyExplorer";
import TopDevelopers from "./TopDevelopers";
import AIMatchingBanner from "./AIMatchingBanner";
import AwardProjects from "./AwardProjects";

const LandingSections = () => {
  return (
    <main className="bg-[#0c0d10] text-white">
      <DeveloperCategories />
      <FeaturedProject />
      <TrendingProjects />
      <TechnologyExplorer />
      <TopDevelopers />
      <AIMatchingBanner />
      <AwardProjects />
    </main>
  );
};

export default LandingSections;
