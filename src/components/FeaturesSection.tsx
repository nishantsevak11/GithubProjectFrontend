import { BarChart3, GitCompare, Users, Code, Lock, Share2 } from "lucide-react";

const features = [
  {
    icon: <BarChart3 className="w-8 h-8 text-white" />,
    title: "In-Depth Analysis",
    description: "Go beyond basic stats with detailed breakdowns of language usage, commit history, and code complexity.",
    bgColor: "bg-indigo-600/20",
    borderColor: "border-indigo-500/30",
  },
  {
    icon: <GitCompare className="w-8 h-8 text-white" />,
    title: "Contribution Tracking",
    description: "Visualize contributor impact over time and identify key developers and their areas of focus.",
    bgColor: "bg-purple-600/20",
    borderColor: "border-purple-500/30",
  },
  {
    icon: <Users className="w-8 h-8 text-white" />,
    title: "Team Collaboration",
    description: "Analyze pull request cycles and review patterns to optimize your team's workflow and efficiency.",
    bgColor: "bg-pink-600/20",
    borderColor: "border-pink-500/30",
  },
  {
    icon: <Code className="w-8 h-8 text-white" />,
    title: "Line-by-Line Analysis",
    description: "Get an accurate count of your repository's source lines of code, ignoring comments and blank lines.",
    bgColor: "bg-red-600/20",
    borderColor: "border-red-500/30",
  },
   {
    icon: <Lock className="w-8 h-8 text-white" />,
    title: "Secure & Private",
    description: "Analyze your private repositories with confidence. We never store your code or personal data.",
    bgColor: "bg-green-600/20",
    borderColor: "border-green-500/30",
  },
  {
    icon: <Share2 className="w-8 h-8 text-white" />,
    title: "Shareable Insights",
    description: "Easily share beautiful, data-rich reports of your repository's statistics with your team or the world.",
    bgColor: "bg-yellow-600/20",
    borderColor: "border-yellow-500/30",
  },
];

const FeatureCard = ({ icon, title, description }) => (
  <div className="transform rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-transparent">
    <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
    <p className="mt-2 text-gray-600">{description}</p>
  </div>
);

const FeaturesSection = () => {
  // Re-map icons to add new styling
  const styledFeatures = [
    {
      ...features[0],
      icon: <BarChart3 className="h-6 w-6 text-gray-700" />,
    },
    {
      ...features[1],
      icon: <GitCompare className="h-6 w-6 text-gray-700" />,
    },
    { ...features[2], icon: <Users className="h-6 w-6 text-gray-700" /> },
    { ...features[3], icon: <Code className="h-6 w-6 text-gray-700" /> },
    { ...features[4], icon: <Lock className="h-6 w-6 text-gray-700" /> },
    { ...features[5], icon: <Share2 className="h-6 w-6 text-gray-700" /> },
  ];

  return (
    <section className="bg-white py-24 sm:py-32">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything You Need to Analyze Code
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Our platform provides a comprehensive suite of tools to give you
            unparalleled insight into your GitHub repositories.
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {styledFeatures.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;