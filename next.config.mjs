/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Feel free to modify/remove this option
    
  // Indicate that these packages should not be bundled by webpack
  experimental: {
      serverComponentsExternalPackages: ['sharp', 'onnxruntime-node'],
  },
};

export default nextConfig;
