import { useNavigate } from "react-router-dom";

function PasswordResetSuccess() {
  const navigate = useNavigate();

  return (
    <div
      className="container-fluid d-flex justify-content-center align-items-center"
      style={{
        minHeight: "100vh",
        background: "#eef0f2",
      }}
    >
      <div
        className="bg-white shadow-sm p-5 text-center"
        style={{
          maxWidth: "700px",
          width: "100%",
          border: "1px solid #ddd",
        }}
      >
        {/* Steps */}

        <div className="d-flex justify-content-center align-items-center mb-5">

          <div className="text-center">

            <div
              className="rounded-circle bg-primary text-white d-flex justify-content-center align-items-center"
              style={{
                width: "70px",
                height: "70px",
                fontSize: "30px",
                margin: "auto",
              }}
            >
              »
            </div>

            <small>Email</small>

          </div>

          <div
            style={{
              width: "120px",
              height: "1px",
              background: "#999",
            }}
          ></div>

          <div className="text-center">

            <div
              className="rounded-circle bg-primary text-white d-flex justify-content-center align-items-center"
              style={{
                width: "70px",
                height: "70px",
                fontSize: "30px",
                margin: "auto",
              }}
            >
              »
            </div>

            <small>Verify</small>

          </div>

          <div
            style={{
              width: "120px",
              height: "1px",
              background: "#999",
            }}
          ></div>

          <div className="text-center">

            <div
              className="rounded-circle bg-primary text-white d-flex justify-content-center align-items-center"
              style={{
                width: "70px",
                height: "70px",
                fontSize: "30px",
                margin: "auto",
              }}
            >
              »
            </div>

            <small>Reset</small>

          </div>

        </div>

        {/* Success Icon */}

        <div
          className="rounded-circle border border-success d-flex justify-content-center align-items-center mx-auto mb-4"
          style={{
            width: "120px",
            height: "120px",
          }}
        >
          <div
            className="rounded-circle bg-success text-white d-flex justify-content-center align-items-center"
            style={{
              width: "60px",
              height: "60px",
              fontSize: "30px",
            }}
          >
            ✓
          </div>
        </div>

        <h1 className="fw-bold mb-3">
          All Done !
        </h1>

        <p
          className="text-secondary mx-auto"
          style={{ maxWidth: "450px" }}
        >
          Your password has been successfully reset.
          Sign in to ClothCore with your new credentials
          and get back to work.
        </p>

        <button
          className="btn btn-primary px-5 py-3 fw-bold mt-3"
          style={{
            letterSpacing: "3px",
          }}
          onClick={() => navigate("/")}
        >
          SIGN IN NOW
        </button>
      </div>
    </div>
  );
}

export default PasswordResetSuccess;