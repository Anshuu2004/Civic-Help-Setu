import React from 'react';

const Privacy = () => {
  return (
    <div className="container max-w-3xl pt-20 pb-24">
      <h1 className="text-4xl font-bold mb-10 text-center">Privacy Policy</h1>
      
      <div className="prose prose-slate">
        <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-xl font-bold mt-8 mb-4">1. Introduction</h2>
        <p className="mb-4 text-muted">
          CivicBridge ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how your information is collected, used, and disclosed by CivicBridge.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-4">2. Information We Collect</h2>
        <p className="mb-4 text-muted">
          We do not require you to create an account to use our core services. We do not ask for or store highly sensitive personal data such as passwords, OTPs, banking credentials, or full identity numbers.
        </p>
        <p className="mb-4 text-muted">
          <strong>Usage Data:</strong> We may collect anonymous usage data to improve our services.
        </p>
        <p className="mb-4 text-muted">
          <strong>Local Storage:</strong> If you use the "Save Guide" feature, this information is stored locally on your device using `localStorage`. We do not transmit this data to our servers.
        </p>
        <p className="mb-4 text-muted">
          <strong>AI Chat Interactions:</strong> In the MVP phase, chat queries are processed securely. We do not permanently log personal details entered into the chat. Please refrain from entering sensitive personal information.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-4">3. How We Use Your Information</h2>
        <p className="mb-4 text-muted">
          We use the information we collect primarily to provide, maintain, and improve our services, and to process your AI assistant queries in real-time.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-4">4. Security</h2>
        <p className="mb-4 text-muted">
          We implement appropriate technical and organizational measures to protect the security of any personal information we process. However, please also remember that we cannot guarantee that the internet itself is 100% secure.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-4">5. Contact Us</h2>
        <p className="mb-4 text-muted">
          If you have questions or comments about this policy, you may email us at privacy@civicbridge.org.
        </p>
      </div>
    </div>
  );
};

export default Privacy;
