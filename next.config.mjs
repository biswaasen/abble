const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  agentRules: false,
  async redirects() {
    return [
      { source: '/story', destination: '/', permanent: false },
      { source: '/form', destination: '/waitlist', permanent: false },
    ];
  },
};

export default nextConfig;
