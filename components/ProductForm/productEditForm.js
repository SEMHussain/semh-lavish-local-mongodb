import DefaultErrorPage from "next/error";
import { useEffect, useRef, useState } from "react";
import { MultiSelect } from "react-multi-select-component";
import { toast } from "react-toastify";
import useSWR from "swr";
import { fetchData, postData } from "~/lib/clientFunctions";
import FileUpload from "../FileUpload/fileUpload";
import TextEditor from "../TextEditor";
import LoadingButton from "../Ui/Button";
import Spinner from "../Ui/Spinner";
import classes from "./productForm.module.css";
import CustomSelect from "../CustomSelect";
import { useTranslation } from "react-i18next";
import MultiSelectItem from "../MultiSelect";
import AddVarient from "./varientList";
import EditVarient from "./editVarientList";
import { PencilSquare, Trash } from "@styled-icons/bootstrap";

const ProductEditForm = (props) => {
  const url = `/api/product/edit?slug=${props.slug}`;
  const { data, error } = useSWR(url, fetchData);

  const product_type = useRef();
  const seo_title = useRef("");
  const seo_desc = useRef("");
  const [selectedColor, setSelectedColor] = useState([]);
  const [selectedAttrs, setSelectedAttrs] = useState([]);
  const [selectedType, setSelectedType] = useState([]);
  const [subcategoryOption, setSubcategoryOption] = useState([]);
  const [childCategoryOption, setChildcategoryOption] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubcategory] = useState([]);
  const [selectedChildcategory, setSelectedChildcategory] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [displayImage, setDisplayImage] = useState([]);
  const [galleryImage, setGalleryImage] = useState([]);
  const [seoImage, setSeoImage] = useState([]);
  const [editorState, setEditorState] = useState("");
  const [buttonState, setButtonState] = useState("");

  const [primaryAttr, setPrimaryAttr] = useState("");
  const [editVarientData, setEditVarientData] = useState(null);
  const [variants, setVarients] = useState([]);
  const [_add, _setAdd] = useState(false);

  const { t } = useTranslation();
  useEffect(() => {
    if (data && data.product) {
      const preSelectedSubcategory = [];
      data.product.subcategories.forEach((el) =>
        preSelectedSubcategory.push({ label: el, value: el })
      );

      const preSelectedChildCategory = [];
      data.product.childCategories.forEach((el) =>
        preSelectedChildCategory.push({ label: el, value: el })
      );

      const preSelectedColor = [];
      data.product.colors.forEach((color) =>
        preSelectedColor.push({
          label: color.name,
          value: color.value,
        })
      );
      setSelectedColor(preSelectedColor);
      setSelectedAttrs(data.product.attributes);
      setSelectedType(data.product.type);
      setSelectedSubcategory(preSelectedSubcategory);
      setSelectedChildcategory(preSelectedChildCategory);
      setVarients(data.product.variants);
      setDisplayImage(data.product.image);
      setGalleryImage(data.product.gallery);
      setSeoImage(data.product.seo.image);
      setEditorState(data.product.description);
      setPrimaryAttr(data.product.attributeIndex || "");
      if (data.product.categories[0]) {
        setSelectedCategory(data.product.categories[0]);
        const category = data.category.find(
          (x) => x.slug === data.product.categories[0]
        );
        const subcategory = [];
        const childCategory = [];
        category.subCategories.forEach((sub) => {
          subcategory.push({ label: sub.name, value: sub.slug });
          sub.child?.forEach((child) => {
            childCategory.push({ label: child.name, value: child.slug });
          });
        });
        setSubcategoryOption(subcategory);
        setChildcategoryOption(childCategory);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  if (error) return <div>failed to load</div>;
  if (!data) return <Spinner />;
  if (!data.product) return <DefaultErrorPage statusCode={404} />;

  const colorOption = [];
  data.color &&
    data.color.map((color) =>
      colorOption.push({ label: color.name, value: color.value })
    );

  const multiList = (item) => {
    const data = [];
    item.map((x) => data.push(x.value));
    return JSON.stringify(data);
  };

  const updatedValueCb = (data) => {
    setEditorState(data);
  };

  function _attributes() {
    const attrs = [];
    data.attribute.map((att) =>
      attrs.push({ label: att.name, value: att.name })
    );
    return attrs;
  }

  const updateDisplayImage = (files) => setDisplayImage(files);
  const updateGalleryImage = (files) => setGalleryImage(files);

  const getEditorStateData = (editorData) => {
    const regex = /(<([^>]+)>)/gi;
    const data = !!editorData.replace(regex, "").length ? editorData : "";
    return data;
  };

  function updateBrand(e) {
    setSelectedBrand(e.target.value);
  }

  function updateCategory(e) {
    setSelectedCategory(e.target.value);
    const category = data.category.find((x) => x.slug === e.target.value);
    if (category) {
      const subcategory = [];
      const childCategory = [];
      category.subCategories.forEach((sub) => {
        subcategory.push({ label: sub.name, value: sub.slug });
        sub.child?.forEach((child) => {
          childCategory.push({ label: child.name, value: child.slug });
        });
      });
      setSubcategoryOption(subcategory);
      setChildcategoryOption(childCategory);
      setSelectedSubcategory([]);
      setSelectedChildcategory([]);
    }
  }

  function colorDataStructure() {
    const arr = [];
    for (let i = 0; i < selectedColor.length; i++) {
      const { label, value, image } = selectedColor[i];
      arr.push({ name: label, value, image: image || null });
    }
    return arr;
  }

  const getPrimaryOrderItems = () => {
    let arr = selectedAttrs.map((x) => x.value);
    if (selectedColor.length > 0) {
      arr = ["color", ...arr];
    }
    if (arr[0] && primaryAttr.length === 0) {
      setPrimaryAttr(arr[0]);
    }
    return arr;
  };

  function formatColor(params) {
    let x = [];
    for (let i = 0; i < params.length; i++) {
      const element = params[i];
      x.push({ name: element.label, value: element.value });
    }
    return x;
  }

  function editVarient(e) {
    setEditVarientData(e);
  }

  function deleteVarient(e) {
    const v = [...variants];
    const res = v.filter((x) => x.id !== e);
    setVarients(res);
  }

  function addVarients(val) {
    const varient = [...variants];
    varient.push(val);
    setVarients(varient);
  }

  function updateVarientData(data) {
    let x = [...variants];
    let idx = x.findIndex((y) => y.id === data.id);
    if (idx > -1) {
      x[idx] = data;
    }
    setVarients(x);
  }

  const formHandler = async (e) => {
    e.preventDefault();
    setButtonState("loading");
    const form = document.querySelector("#product_form");
    const formData = new FormData(form);
    const displayImg = JSON.stringify(displayImage);
    const galleryImg = JSON.stringify(galleryImage);
    const seo = {
      title: seo_title.current.value.trim(),
      description: seo_desc.current.value.trim(),
      image: seoImage,
    };
    formData.append("displayImage", displayImg);
    formData.append("galleryImages", galleryImg);
    formData.append("type", selectedType);
    formData.append("category", JSON.stringify([selectedCategory]));
    formData.append("subcategory", multiList(selectedSubCategory));
    formData.append("childCategory", multiList(selectedChildcategory));
    formData.append("brand", selectedBrand);
    formData.append("color", JSON.stringify(colorDataStructure()));
    formData.append("attribute", JSON.stringify(selectedAttrs));
    formData.append("selectedAttribute", primaryAttr);
    formData.append("variant", JSON.stringify(variants));
    formData.append("seo", JSON.stringify(seo));
    formData.append("description", getEditorStateData(editorState));
    await postData("/api/product/edit", formData)
      .then((status) =>
        status.success
          ? toast.success("Product Updated Successfully")
          : toast.error("Something Went Wrong")
      )
      .catch((err) => {
        console.log(err);
        toast.error(`Something Went Wrong ${err.message}`);
      });
    setButtonState("");
  };

  return (
    <>
      <form
        id="product_form"
        encType="multipart/form-data"
        onSubmit={formHandler}
      >
        {imageInput()}
        <input type="hidden" name="pid" defaultValue={data.product._id} />
        {productInformation()}
        {productDescription()}
        {productType()}
        {productTypeInput()}
        {seoInput()}
        <div className="py-3">
          <LoadingButton
            type="submit"
            text={t("Update Product")}
            state={buttonState}
          />
        </div>
      </form>
      {_add && (
        <AddVarient
          close={() => _setAdd(false)}
          attribute={data.attribute}
          selectedAttrs={selectedAttrs}
          color={formatColor(selectedColor)}
          hasColor={selectedColor.length > 0}
          setVariable={addVarients}
          primary={primaryAttr}
          galleryImage={galleryImage}
        />
      )}
      {editVarientData && (
        <EditVarient
          close={() => setEditVarientData(null)}
          setVariable={(x) => updateVarientData(x)}
          varientData={editVarientData}
          galleryImage={galleryImage}
        />
      )}
    </>
  );

  function productDescription() {
    return (
      <div className="card mb-5 border-0 shadow">
        <div className="card-header bg-white py-3 fw-bold">
          {t("Product Description")}
        </div>
        <div className="card-body">
          <div className="py-3">
            <label htmlFor="inp-7" className="form-label">
              {t("Short Description")}*
            </label>
            <textarea
              id="inp-7"
              className={classes.input + " form-control"}
              name="short_description"
              defaultValue={data.product.shortDescription}
            />
          </div>
          <div className="py-3">
            <label className="form-label">{t("description")}</label>
            <TextEditor
              previousValue={editorState}
              updatedValue={updatedValueCb}
              height={300}
            />
          </div>
        </div>
      </div>
    );
  }

  function productTypeInput() {
    return (
      <div>
        {selectedType === "simple" && (
          <div className="card mb-5 border-0 shadow">
            <div className="card-header bg-white py-3 fw-bold">
              {t("Product Information")}
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-12">
                  <div className="py-3">
                    <label htmlFor="inp-6" className="form-label">
                      {t("Item Quantity")}*({t("Set -1 to make it unlimited")})
                    </label>
                    <input
                      type="number"
                      min="-1"
                      id="inp-6"
                      className={classes.input + " form-control"}
                      name="qty"
                      defaultValue={data.product.quantity}
                      required
                      onWheel={(e) => e.target.blur()}
                    />
                  </div>
                </div>
                <div className="col-12">
                  <div className="py-3">
                    <label className="form-label">{t("sku")}*</label>
                    <input
                      type="text"
                      className={classes.input + " form-control"}
                      name="sku"
                      defaultValue={data.product.sku}
                      required
                    />
                  </div>
                </div>
                <div className="col-12">
                  <div className="py-3">
                    <label htmlFor="inp-5" className="form-label">
                      {t("Discount in Percentage")}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      id="inp-5"
                      placeholder="0.0%"
                      className={classes.input + " form-control"}
                      name="sale_price"
                      defaultValue={data.product.discount}
                      onWheel={(e) => e.target.blur()}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {selectedType === "variable" && (
          <div className="card mb-5 border-0 shadow-sm">
            <div className="card-header bg-white py-3">
              {t("Product Variation")}
            </div>
            <div className="card-body">
              <div className="row py-3">
                <label className="form-label">{t("Colors")}</label>
                <MultiSelect
                  options={colorOption}
                  onChange={(e) => {
                    setSelectedColor(e);
                  }}
                  value={selectedColor}
                  labelledBy="Select Color"
                />
              </div>
              <div className="py-3">
                <MultiSelectItem
                  options={_attributes()}
                  label={t("Attributes")}
                  setParentData={setSelectedAttrs}
                  preSelectedData={selectedAttrs}
                />
              </div>
              {(selectedColor.length > 0 || selectedAttrs.length > 0) && (
                <div className="py-3">
                  <label htmlFor="inp-1100" className="form-label">
                    {t("Select Primary Attribute")}
                  </label>
                  <select
                    className="form-control"
                    id="inp-1100"
                    onChange={(e) => {
                      setPrimaryAttr(e.target.value);
                      setVarients([]);
                    }}
                    defaultValue={data.product.attributeIndex}
                  >
                    {getPrimaryOrderItems().map((x, i) => (
                      <option key={i} value={x}>
                        {x}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="table-responsive mt-3">
                <table className="table">
                  <thead>
                    <tr>
                      {variants[0] &&
                        Object.keys(variants[0]).map((x, i) => (
                          <th key={i}>
                            <b>{x.toLocaleUpperCase()}</b>
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody>
                    {variants.map((x, i) => (
                      <tr key={i}>
                        {Object.keys(x).map((key, i) => (
                          <td key={i}>
                            {Array.isArray(x[key]) &&
                              x[key].map((x, i) => (
                                <div key={i}>
                                  <span className="text-primary">
                                    Name: {x.name}
                                  </span>
                                  ,
                                  <span className="text-primary">
                                    {" "}
                                    Qty: {x.qty}
                                  </span>
                                  ,
                                  <span className="text-primary">
                                    {" "}
                                    Price: {x.price}
                                  </span>
                                  ,
                                  <span className="text-primary">
                                    {" "}
                                    Discount: {x.discount}%
                                  </span>
                                </div>
                              ))}
                            {typeof x[key] === "string" && (
                              <span>{x[key]}</span>
                            )}
                            {key === "id" && <span>{x.id}</span>}
                            {x[key].name && (
                              <div>
                                <span className="text-primary">
                                  {x[key].name}
                                </span>
                                <span className="text-primary">
                                  {x[key].value}
                                </span>
                              </div>
                            )}
                          </td>
                        ))}
                        <td>
                          <button
                            className="btn btn-primary btn-sm rounded-0"
                            type="button"
                            onClick={() => editVarient(x)}
                          >
                            <PencilSquare width={15} height={15} />
                          </button>
                          <button
                            className="btn btn-danger btn-sm rounded-0"
                            type="button"
                            onClick={() => deleteVarient(x.id)}
                          >
                            <Trash width={15} height={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                onClick={() => _setAdd(true)}
                type="button"
                className="btn btn-success my-2"
              >
                Add Varient
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  function productType() {
    return (
      <div className="card mb-5 border-0 shadow">
        <div className="card-header bg-white py-3 fw-bold">
          {t("Product Type")}
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-4">
              <div className="py-3">
                <label htmlFor="inp-110" className="form-label">
                  {t("new_product")}
                </label>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="inp-110"
                    name="new_product"
                    defaultChecked={data.product.new}
                  />
                  <label className="form-check-label" htmlFor="inp-110">
                    {t("status")}
                  </label>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="py-3">
                <label htmlFor="inp-11" className="form-label">
                  {t("trending_product")}
                </label>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="inp-11"
                    name="trending"
                    defaultChecked={data.product.trending}
                  />
                  <label className="form-check-label" htmlFor="inp-11">
                    {t("status")}
                  </label>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="py-3">
                <label htmlFor="inp-111" className="form-label">
                  {t("best_selling_product")}
                </label>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="inp-111"
                    name="best_selling"
                    defaultChecked={data.product.bestSelling}
                  />
                  <label className="form-check-label" htmlFor="inp-111">
                    {t("status")}
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div className="col-12">
            <div className="py-3">
              <label htmlFor="inp-type" className="form-label">
                {t("Product Type")}*
              </label>
              <select
                id="inp-type"
                ref={product_type}
                className={classes.input + " form-control"}
                required
                onChange={() => setSelectedType(product_type.current.value)}
                defaultValue={data.product.type}
              >
                <option value="" disabled>
                  {t("Select Product Type")}
                </option>
                <option value="simple">Simple Product</option>
                <option value="variable">Variable Product</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function productInformation() {
    return (
      <div className="card mb-5 border-0 shadow">
        <div className="card-header bg-white py-3 fw-bold">
          {t("Product Description")}
        </div>
        <div className="card-body">
          <div className="py-3">
            <label htmlFor="inp-1" className="form-label">
              {t("name")}*
            </label>
            <input
              type="text"
              id="inp-1"
              className={classes.input + " form-control"}
              name="name"
              defaultValue={data.product.name}
              required
            />
          </div>
          <div className="row">
            <div className="col-12 col-sm-6">
              <div className="py-3">
                <label htmlFor="inp-2" className="form-label">
                  {t("Unit")}*
                </label>
                <input
                  type="text"
                  id="inp-2"
                  className={classes.input + " form-control"}
                  name="unit"
                  defaultValue={data.product.unit}
                  required
                />
              </div>
            </div>
            <div className="col-12 col-sm-6">
              <div className="py-3">
                <label htmlFor="inp-3" className="form-label">
                  {t("Unit Value")}*
                </label>
                <input
                  type="text"
                  id="inp-3"
                  className={classes.input + " form-control"}
                  name="unit_val"
                  defaultValue={data.product.unitValue}
                  required
                />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-12 col-sm-6">
              <div className="py-3">
                <label htmlFor="inp-4" className="form-label">
                  {t("price")}*
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  id="inp-4"
                  className={classes.input + " form-control"}
                  name="main_price"
                  defaultValue={data.product.price}
                  required
                  onWheel={(e) => e.target.blur()}
                />
              </div>
            </div>
            <div className="col-12 col-sm-6">
              <div className="py-3">
                <label className="form-label">{t("categories")}*</label>
                <select
                  className="form-control"
                  onChange={updateCategory}
                  required
                  value={selectedCategory || ""}
                >
                  <option value="">None</option>
                  {data.category &&
                    data.category.map((x) => (
                      <option value={x.slug} key={x._id}>
                        {x.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
            <div className="col-12 col-sm-6">
              <div className="py-3">
                <label className="form-label">{t("Subcategories")}*</label>
                <MultiSelect
                  options={subcategoryOption}
                  onChange={setSelectedSubcategory}
                  value={selectedSubCategory}
                  labelledBy="Select"
                />
              </div>
            </div>
            <div className="col-12 col-sm-6">
              <div className="py-3">
                <label className="form-label">{t("Child Categories")}*</label>
                <MultiSelect
                  options={childCategoryOption}
                  onChange={setSelectedChildcategory}
                  value={selectedChildcategory}
                  labelledBy="Select"
                />
              </div>
            </div>
            <div className="col-12 col-sm-6">
              <div className="py-3">
                <label className="form-label">{t("brand")}</label>
                <select
                  className="form-control"
                  onChange={updateBrand}
                  defaultValue={data.product.brand}
                >
                  <option value="">None</option>
                  {data.brand &&
                    data.brand.map((x) => (
                      <option value={x.slug} key={x._id}>
                        {x.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function imageInput() {
    return (
      <div className="card mb-5 border-0 shadow">
        <div className="card-header bg-white py-3 fw-bold">
          {t("Product Image")}
        </div>
        <div className="card-body">
          <FileUpload
            accept=".jpg,.png,.jpeg"
            label={t("Display Image")}
            maxFileSizeInBytes={2000000}
            updateFilesCb={updateDisplayImage}
            preSelectedFiles={data.product.image}
          />

          <FileUpload
            accept=".jpg,.png,.jpeg"
            label={t("Gallery Images")}
            multiple
            maxFileSizeInBytes={2000000}
            updateFilesCb={updateGalleryImage}
            preSelectedFiles={data.product.gallery}
          />
        </div>
      </div>
    );
  }

  function seoInput() {
    return (
      <div className="card mb-5 border-0 shadow">
        <div className="card-header bg-white py-3 fw-bold">
          {t("SEO Meta Tags")}
        </div>
        <div className="card-body">
          <div className="py-3">
            <label htmlFor="inp-122" className="form-label">
              {t("Meta Title")}
            </label>
            <input
              type="text"
              ref={seo_title}
              id="inp-122"
              className="form-control"
              defaultValue={data.product.seo.title}
            />
          </div>
          <div className="py-3">
            <label htmlFor="inp-222" className="form-label">
              {t("Meta Description")}
            </label>
            <textarea
              ref={seo_desc}
              id="inp-222"
              className="form-control"
              defaultValue={data.product.seo.description}
            />
          </div>
          <FileUpload
            accept=".jpg,.png,.jpeg"
            label={t("Meta Image")}
            maxFileSizeInBytes={2000000}
            updateFilesCb={setSeoImage}
            preSelectedFiles={data.product.seo.image}
          />
        </div>
      </div>
    );
  }
};

export default ProductEditForm;
