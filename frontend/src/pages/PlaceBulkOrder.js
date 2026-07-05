import React, { useState, useRef } from "react";
import tshirt from "../assets/tshirt.png.jpg";
import polo from "../assets/polo.png.jpg";
import trouser from "../assets/trouser.png.jpg";
import uniform from "../assets/uniform.png.webp";
import { useNavigate } from "react-router-dom";


function CreateOrder() {

const navigate = useNavigate();
  const [sizes, setSizes] = useState([
    { size: "S", qty: 0 },
    { size: "M", qty: 0 },
    { size: "L", qty: 0 },
    { size: "XL", qty: 0 },
    { size: "XXL", qty: 0 },
  ]);
const addToOrder = () => {

  const totalQty = sizes.reduce(
    (sum, item) => sum + item.qty,
    0
  );

  const newItem = {
    garment: selectedGarment,
    image: garmentImages[selectedGarment],
    fabric: selectedFabric,
color: selectedColor,
    quantity: totalQty,
  };

  if (isEditing) {

  const updatedItems = [...orderItems];

  updatedItems[editIndex] = newItem;

  setOrderItems(updatedItems);

  setIsEditing(false);
  setEditIndex(null);

} else {

  setOrderItems([...orderItems, newItem]);

}
  setDesignConfirmed(false);
  setSelectedFile(null);
  setPreviewImage("");
  setAiPreviewImage("");
  setAiPrompt("");

setSelectedGarment("T-Shirt");
setSelectedFabric("100% Cotton");
setSelectedColor("Navy Blue");

setSizes([
  { size: "S", qty: 0 },
  { size: "M", qty: 0 },
  { size: "L", qty: 0 },
  { size: "XL", qty: 0 },
  { size: "XXL", qty: 0 },
]);


};
  const increaseQty = (index) => {
    const updated = [...sizes];
    updated[index].qty += 1;
    setSizes(updated);
  };

  const deleteItem = (index) => {

  const updatedItems = [...orderItems];

  updatedItems.splice(index, 1);

  setOrderItems(updatedItems);

};


const editItem = (index) => {

  const item = orderItems[index];

  setSelectedGarment(item.garment);
  setSelectedFabric(item.fabric);
  setSelectedColor(item.color);

  setEditIndex(index);
  setIsEditing(true);

};

  const decreaseQty = (index) => {
    const updated = [...sizes];

    if (updated[index].qty > 0) {
      updated[index].qty -= 1;
    }

    setSizes(updated);
  };

  const totalQty = sizes.reduce(
    (total, item) => total + item.qty, 0);
    const [selectedGarment, setSelectedGarment] = useState("T-Shirt");
    const [selectedFabric, setSelectedFabric] = useState("100% Cotton");
    const [selectedColor, setSelectedColor] = useState("Navy Blue");
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewImage, setPreviewImage] = useState("");
    const [aiPrompt, setAiPrompt] = useState("");
    const [aiPreviewImage, setAiPreviewImage] = useState("");
    const [designConfirmed, setDesignConfirmed] = useState(false);
    const fileInputRef = useRef(null);
    const [orderItems, setOrderItems] = useState([]);
const [editIndex, setEditIndex] = useState(null);
const [isEditing, setIsEditing] = useState(false);

const totalOrderQty = orderItems.reduce(
  (sum, item) => sum + item.quantity,
  0
);

    const garmentImages = {
  "T-Shirt": tshirt,
  "Polo Shirt": polo,
  "Trouser": trouser,
  "School Uniform": uniform,
};

const handleFileChange = (e) => {

  const file = e.target.files[0];

  if (file) {

    setSelectedFile(file);

    setPreviewImage(URL.createObjectURL(file));

  }

};

const generateAIDesign = () => {

  if (!aiPrompt.trim()) {
    alert("Please enter a design prompt.");
    return;
  }


};
  return (

    <div className="container-fluid bg-light p-4">

      {/* ================= HEADER ================= */}

      <div className="d-flex justify-content-between align-items-center mb-4">


        <div className="d-flex align-items-center">

          <div className="text-center me-5">
            <div className="rounded-circle bg-primary text-white mx-auto mb-2"
              style={{
                width: 35,
                height: 35,
                lineHeight: "35px"
              }}>
              1
            </div>

            <small className="fw-bold">
              Garment Details
            </small>
          </div>

          <div className="text-center me-5">
            <div className="rounded-circle bg-primary text-white mx-auto mb-2"
              style={{
                width: 35,
                height: 35,
                lineHeight: "35px"
              }}>
              2
            </div>

            <small>
              Quantities & Delivery
            </small>
          </div>

          <div className="text-center">
            <div className="rounded-circle border mx-auto mb-2"
              style={{
                width: 35,
                height: 35,
                lineHeight: "35px"
              }}>
              3
            </div>

            <small>
              Review & Submit
            </small>
          </div>

        </div>

        <button className="btn btn-outline-primary">
          💾 Save Draft
        </button>

      </div>

      {/* ================= CONTENT ================= */}

      <div className="row">

        {/* LEFT SIDE */}

        <div className="col-lg-8">

          <div className="card shadow-sm">

            <div className="card-body">

              <h4 className="fw-bold">
                Step 1 : Garment Details
              </h4>

              <p className="text-muted">
                Select garment type, fabric, color and upload design or use AI to generate.
              </p>

              <hr />

<div className="row mt-4">
  

  {/* Garment Type */}
  <div className="col-lg-7">

    <label className="fw-bold mb-3">
      1. Select Garment Type
    </label>

    <div className="row">

      <div className="col-3">
<div
  className={`card shadow-sm text-center p-2 ${
    selectedGarment === "T-Shirt"
      ? "border border-primary"
      : ""
  }`}
  style={{ cursor: "pointer" }}
  onClick={() => setSelectedGarment("T-Shirt")}
>
<img
  src={tshirt}
  className="img-fluid mx-auto"
  alt="T-Shirt"
  style={{ height: "100px", objectFit: "contain" }}
/>

<small className="fw-bold mt-2">
  T-Shirt
</small>

        </div>
      </div>

      <div className="col-3">

<div
  className={`card shadow-sm text-center p-2 ${
    selectedGarment === "Polo Shirt"
      ? "border border-primary"
      : ""
  }`}
  style={{ cursor: "pointer" }}
  onClick={() => setSelectedGarment("Polo Shirt")}
>
  <img
  src={polo}
  className="img-fluid mx-auto"
  alt="Polo Shirt"
  style={{ height: "100px", objectFit: "contain" }}
/>

<small className="fw-bold mt-2">
  Polo Shirt
</small>

        </div>

      </div>

      <div className="col-3">
        <div
  className={`card shadow-sm text-center p-2 ${
    selectedGarment === "Trouser"
      ? "border border-primary"
      : ""
  }`}
  style={{ cursor: "pointer" }}
  onClick={() => setSelectedGarment("Trouser")}
>

<img
  src={trouser}
  className="img-fluid mx-auto"
  alt="Trouser"
  style={{ height: "100px", objectFit: "contain" }}
/>

<small className="fw-bold mt-2">
  Trouser
</small>

        </div>
      </div>

      <div className="col-3">
<div
  className={`card shadow-sm text-center p-2 ${
    selectedGarment === "School Uniform"
      ? "border border-primary"
      : ""
  }`}
  style={{ cursor: "pointer" }}
  onClick={() => setSelectedGarment("School Uniform")}
>

 <img
  src={uniform}
  className="img-fluid mx-auto"
  alt="School Uniform"
  style={{ height: "100px", objectFit: "contain" }}
/>

<small className="fw-bold mt-2">
  School Uniform
</small>

        </div>
      </div>

    </div>

  </div>

  {/* Fabric & Color */}

  <div className="col-lg-5">

    <div className="mb-3">

      <label className="fw-bold">
        2. Fabric Material
      </label>

      <select
  className="form-select mt-2"
  value={selectedFabric}
  onChange={(e) => setSelectedFabric(e.target.value)}
>

  <option>100% Cotton</option>
  <option>Poly Cotton</option>
  <option>Cotton Drill</option>
  <option>Linen</option>

</select>

    </div>

    <div>

      <label className="fw-bold">
        3. Primary Color
      </label>

      <select
  className="form-select mt-2"
  value={selectedColor}
  onChange={(e) => setSelectedColor(e.target.value)}
>

  <option>Navy Blue</option>
  <option>Black</option>
  <option>White</option>
  <option>Gray</option>

</select>

    </div>

  </div>
{/* Upload Design */}
<hr className="my-5" />

<div className="row">

  {/* Upload */}
  <div className="col-md-6">

    <label className="fw-bold mb-3">
      4. Upload Your Design
    </label>

   <div className="text-center py-4">
    

{previewImage ? (

  <>

    <div className="d-flex justify-content-between align-items-center mb-3">

      <h6 className="fw-bold mb-0">
        🖼 Uploaded Design Preview
      </h6>

      <span className="badge bg-success">
        Ready
      </span>

    </div>

    <img
      src={previewImage}
      alt="Uploaded Design"
      className="preview-image"
    />

  </>

) : (

  <>
    <h1>📤</h1>

    <h5>Drag & Drop Design Here</h5>

    <p className="text-muted">
      JPG, PNG, PDF, AI (Max 10MB)
    </p>

    <button
      className="btn btn-primary"
      onClick={() => fileInputRef.current?.click()}
    >
      Browse Files
    </button>

  </>

)}

</div>

  </div>
  
{selectedFile && (

  <div
    className="border rounded p-3 mt-3"
    style={{
      background: "#F8FFF8",
      borderColor: "#28a745"
    }}
  >

    <div className="d-flex justify-content-between align-items-center">

      <div>

        <div className="fw-bold text-success">
          ✅ Selected Design
        </div>

      <div>

  <div className="fw-semibold">
    {selectedFile.name}
  </div>

  <div className="mt-1">

    <span className="badge bg-light text-dark border me-2">
      {selectedFile.name.split(".").pop().toUpperCase()}
    </span>

    <small className="text-secondary">
      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
    </small>

  </div>

</div>

      </div>

<div className="d-flex gap-2">

  <button
    className="btn btn-outline-primary btn-sm"
    onClick={() => fileInputRef.current?.click()}
  >
    Change
  </button>

  <button
    className="btn btn-outline-danger btn-sm"
    onClick={() => {
      setSelectedFile(null);
      setPreviewImage("");
    }}
  >
    🗑 Remove
  </button>

</div>

    </div>

  </div>

)}

  {/* AI */}
  <div className="col-md-6">

    <label className="fw-bold mb-3">
      5. AI Design Generator
    </label>

    <div className="card shadow-sm">

      <div className="card-body">

        <textarea
  className="form-control"
  rows="4"
  placeholder="Describe your design..."
  value={aiPrompt}
  onChange={(e) => setAiPrompt(e.target.value)}
></textarea>

      <button
  className="btn btn-dark"
  onClick={generateAIDesign}
>
 ✨ Generate with AI
</button>

      </div>

    </div>

  </div>

</div>



<div className="card mt-4 shadow-sm">

  <div className="card-body">

    <div className="d-flex justify-content-between align-items-center">

      <div>

        <h5 className="fw-bold">
          AI Generated Preview
        </h5>

        <small className="text-muted">
          Preview before selecting
        </small>

      </div>

      <button className="btn btn-outline-primary">
        🔄 Generate Again
      </button>

    </div>

  <div className="text-center py-4">

  {aiPreviewImage ? (

    <>

      <div className="d-flex justify-content-between align-items-center mb-3">

        <span className="badge bg-success">
          Generated
        </span>

      </div>

      <img
        src={aiPreviewImage}
        alt="AI Design"
        className="preview-image"
      />
      <div className="mt-4">

  
  {designConfirmed && (

  <div
    className="alert alert-success mt-3"
    role="alert"
  >
    ✅ Design Selected Successfully!
    <br />
    You can now add this item to your order.
  </div>

)}

</div>

    </>

  ) : (

    <>

      <h1>🎨</h1>

      <h5>No AI Design Yet</h5>

      <p className="text-muted">
        Enter a prompt and click "Generate with AI".
      </p>

    </>

  )}

</div>

  <button
  className={`btn px-4 ${
    designConfirmed ? "btn-success" : "btn-primary"
  }`}
  onClick={() => setDesignConfirmed(true)}
  disabled={designConfirmed}
>
  {designConfirmed ? "✔ Design Selected" : "✓ Use This Design"}
</button>

  </div>
          {/* ================= STEP 2 ================= */}

<div className="card shadow-sm mt-5">

  <div className="card-body">

    <h4 className="fw-bold">
      Step 2 : Quantities
    </h4>

    <p className="text-muted">
      Specify quantities by size and preferred delivery date.
    </p>

    <hr />

    <div className="row">

     {/* Size Breakdown */}

<h5 className="fw-bold mt-4">
  Size Breakdown (Minimum 100 total units)
</h5>

<div className="row mt-3 g-3">

  {sizes.map((item, index) => (

    <div className="col" key={item.size}>

      <div
        className="border rounded text-center p-2 bg-white"
        style={{
          borderColor: "#e9ecef",
          minHeight: "95px"
        }}
      >

        <h5 className="fw-bold mb-3">
          {item.size}
        </h5>

        <div
          className="border rounded d-flex justify-content-between align-items-center px-2"
          style={{
            height: "38px",
            background: "#fff"
          }}
        >

          <button
  className="btn p-0 border-0"
  style={{
    fontSize: "20px",
    width: "30px"
  }}
  onClick={() => decreaseQty(index)}
>
  −
</button>

          <span
            className="fw-bold"
            style={{ fontSize: "18px" }}
          >
            {item.qty}
          </span>

          <button
  className="btn p-0 border-0"
  style={{
    fontSize: "20px",
    width: "30px"
  }}
  onClick={() => increaseQty(index)
    
  }
  
>
  +
</button>

        </div>

      </div>

    </div>

  ))}

</div>

<div className="d-flex justify-content-between align-items-center mt-4">

  <div className="form-check">

    <input
  type="file"
  ref={fileInputRef}
  style={{ display: "none" }}
  accept=".jpg,.jpeg,.png,.pdf,.ai"
  onChange={handleFileChange}
/>

    <label
      className="form-check-label"
      htmlFor="saveTemplate"
    >
      Save this item as template (optional)
    </label>

  </div>
<div className="mt-4">

  <strong>
    Total Quantity : {totalQty} pcs
  </strong>

</div>

  <button
  className="btn btn-primary"
  onClick={addToOrder}
  disabled={!designConfirmed}
>
   {isEditing
    ? "Update Item"
    : designConfirmed
    ? "Add to Order"
    : "Use Design First"}
</button>

</div>



    </div>

    <hr />

    <div className="d-flex justify-content-between">

     <button
  className="btn btn-outline-secondary"
  onClick={() => navigate(-1)}
>
  ← Back
</button>

    <button
  className="btn btn-primary"
  onClick={() => navigate("/review-submit")}
>
  Next Step →
</button>

    </div>

  </div>

</div>

</div>
</div>

            </div>

          </div>

        </div>

        {/* RIGHT SIDE */}

        <div className="col-lg-4">

          <div className="card shadow-sm">

            <div className="card-body">

              <hr />

              <div className="d-flex justify-content-between align-items-center mb-3">

  <h5 className="fw-bold mb-0">
    Order Summary ({orderItems.length} Items)
  </h5>

  <button
    className="btn btn-outline-primary btn-sm"
  >
    Edit All
  </button>

</div>

<hr />

{orderItems.map((item, index) => (

  <div
  key={index}
  className="d-flex align-items-center justify-content-between border rounded p-3 mb-3 shadow-sm"
>
<div
  className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
  style={{
    width: "28px",
    height: "28px",
    fontSize: "13px",
    fontWeight: "bold"
  }}
>
  {index + 1}
</div>

    <img
      src={item.image}
      alt={item.garment}
      style={{
        width: "70px",
        height: "70px",
        objectFit: "contain"
      }}
    />

    <div className="ms-3 flex-grow-1">

      <h6 className="fw-bold mb-1">
        {item.garment}
      </h6>

      <small className="text-muted d-block">
        Fabric : {item.fabric}
      </small>

      <small className="text-muted d-block">
        Color : {item.color}
      </small>

    </div>

    <div className="text-end">

      <div
  className="px-3 py-2 rounded text-primary fw-bold"
  style={{
    background: "#EEF3FF",
    minWidth: "80px",
    textAlign: "center"
  }}
>
  {item.quantity} pcs
</div>

      <div className="mt-2">

       <small
  className="text-primary d-block"
  style={{ cursor: "pointer" }}
  onClick={() => editItem(index)}
>
  ✏ Edit
</small>

        <small
  className="text-danger"
  style={{ cursor: "pointer" }}
  onClick={() => deleteItem(index)}
>
  🗑 Delete
</small>

      </div>

    </div>

  </div>

))}

<div className="card border-0 mt-3" style={{ background: "#F7F9FF" }}>

  <div className="card-body">

    <div className="d-flex justify-content-between">

      <strong>Total Quantity (All Items)</strong>

      <strong className="text-primary">
        {totalOrderQty} pcs
      </strong>

    </div>

    <hr />

    <div className="d-flex justify-content-between">

      <span>Minimum Required</span>

      <strong>100 pcs</strong>

    </div>

    <div className="mt-2">

      {totalOrderQty >= 100 ? (

        <span className="text-success fw-bold">
          ✔ Requirement Met
        </span>

      ) : (

        <span className="text-danger fw-bold">
          ⚠ Need More Units
        </span>

      )}

    </div>

  </div>

</div>

<hr />

<hr className="my-4" />

<div className="card border-0 shadow-sm">
  <div className="card-body">

    <h5 className="fw-bold mb-3">
      💡 Why this works better?
    </h5>

    <div className="d-flex align-items-start mb-3">

  <span className="text-success fs-5 me-2">
    ✔
  </span>

  <span>
    Each garment has its own design/logo
  </span>
  

</div>

<div className="d-flex align-items-start mb-3">

  <span className="text-success fs-5 me-2">
    ✔
  </span>

  <span>
    AI can generate a unique design
  </span>

</div>

<div className="d-flex align-items-start mb-3">

  <span className="text-success fs-5 me-2">
    ✔
  </span>

  <span>
    No confusion - items are listed separately
  </span>

</div>

<div className="d-flex align-items-start mb-3">

  <span className="text-success fs-5 me-2">
    ✔
  </span>

  <span>
    Easy to edit, delete or add garments
  </span>

</div>

<div className="d-flex align-items-start">

  <span className="text-success fs-5 me-2">
    ✔
  </span>

  <span>
    Clear summary before next step
  </span>

</div>



  </div>
</div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default CreateOrder;