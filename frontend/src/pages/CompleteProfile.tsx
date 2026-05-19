import AuthBranding from '@/components/auth/AuthBranding';
import ProfileForm from '@/components/profile/ProfileForm';

const CompleteProfile = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-[url('/bg-login.jpeg')] bg-cover bg-center"
        aria-hidden="true"
      />

      {/* White overlay */}
      <div className="absolute inset-0 bg-white/70" aria-hidden="true" />

      {/* Content (always in front) */}
      <div className="relative flex-1 flex flex-col lg:flex-row">
        <AuthBranding />

        {/* Right Side - Auth Form */}
        <div className="lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-12">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8 animate-slideUp">
              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Create Profile
                </h2>
                <p className="text-gray-600">
                  Create your account with complete details
                </p>
              </div>

              {/* Auth Form */}
              <ProfileForm />

              {/* Demo Login */}
              {/* <DemoLoginButton onDemoLogin={handleDemoLogin} /> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;
