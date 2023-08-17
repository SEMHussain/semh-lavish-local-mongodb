import customId from "custom-id-new";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import InnerImageZoom from "react-inner-image-zoom";
import "react-inner-image-zoom/lib/InnerImageZoom/styles.min.css";
import { useDispatch, useSelector } from "react-redux";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { toast } from "react-toastify";
import useSWR from "swr";
import ImageLoader from "~/components/Image";
import { fetchData } from "~/lib/clientFunctions";
import { addToCart, addVariableProductToCart } from "~/redux/cart.slice";
import Spinner from "../../Ui/Spinner";
import classes from "./productDetails.module.css";
import { useTranslation } from "react-i18next";
import VarientView from "./varientView";
import { isEqual } from "lodash";
const Carousel = dynamic(() =>
  import("react-responsive-carousel").then((com) => com.Carousel)
);

const ProductDetails = (props) => {
  const url = `/api/product/${props.productSlug}`;
  const { data, error } = useSWR(url, fetchData);
  const [stockAv, setStockAv] = useState(true);
  const [price, setPrice] = useState(0);
  const [discountPrice, setDiscountPrice] = useState(0);
  const [variant, setVariant] = useState({});
  const [selectedImage, setSelectedImage] = useState(0);

  const dispatch = useDispatch();
  const quantityAmount = useRef();
  const cartData = useSelector((state) => state.cart);
  const settings = useSelector((state) => state.settings);
  const { t } = useTranslation();

  useEffect(() => {
    if (data && data.product && data.product.type === "simple") {
      setDiscountPrice(data.product.price);
      setPrice(
        data.product.price - (data.product.discount / 100) * data.product.price
      );
    }
  }, [data]);

  if (error) return <div className="text-danger">failed to load</div>;
  if (!data) return <Spinner />;
  if (!data.product) return <div>Something Went Wrong...</div>;

  const stepUpQty = () => {
    quantityAmount.current.stepUp();
  };

  const stepDownQty = () => {
    quantityAmount.current.stepDown();
  };

  const simpleProductCart = (qty) => {
    const { _id, name, image, quantity } = data.product;
    const existed = cartData.items.find((item) => item._id === _id);
    const totalQty = existed ? existed.qty + qty : qty;
    if (quantity === -1 || quantity >= totalQty) {
      const cartItem = {
        _id,
        uid: customId({ randomLength: 6 }),
        name,
        image,
        price: Number(price),
        qty,
        maxQty: quantity,
        variant: null,
      };
      dispatch(addToCart(cartItem));
      toast.success("Added to Cart");
    } else {
      toast.error("This item is out of stock!");
    }
  };

  const checkQty = (prevQty, currentQty, availableQty) => {
    const avQty = Number(availableQty);
    if (avQty === -1) {
      return true;
    } else {
      return prevQty + currentQty <= avQty;
    }
  };

  function checkVariantInfo(v) {
    let minQty = [];
    let rootVar = data.product.variants.find((x) => x.id === v.id);
    if (rootVar) {
      Object.keys(v).forEach((k) => {
        if (Array.isArray(rootVar[k])) {
          const res = rootVar[k].find((x) => x.name === v[k]);
          if (res) {
            minQty.push(res.qty);
          }
        }
      });
    }
    return Math.min(...minQty);
  }

  const variableProductCart = (qty) => {
    try {
      const { _id, name, image } = data.product;
      const existedProduct = cartData.items.find(
        (item) => item._id === _id && isEqual(item.variant, variant)
      );
      const existedQty = existedProduct ? existedProduct.qty : 0;
      const variantMinQty = checkVariantInfo(variant);
      const qtyAvailable =
        variantMinQty && checkQty(existedQty, qty, variantMinQty);
      if (qtyAvailable) {
        const cartItem = {
          _id,
          uid: customId({ randomLength: 6 }),
          name,
          image,
          price: Number(price),
          qty,
          maxQty: +variantMinQty,
          variant,
        };
        dispatch(addVariableProductToCart(cartItem));
        toast.success("Added to Cart");
      } else {
        toast.error("This item is out of stock!");
      }
    } catch (err) {
      console.log(err);
      toast.error("Something Went Wrong");
    }
  };

  const addItemToCart = () => {
    const qty = Number(quantityAmount.current.value);
    if (data.product.type === "simple") {
      simpleProductCart(qty);
    } else {
      variableProductCart(qty);
    }
  };

  const thumbs = () => {
    const thumbList = data.product.gallery.map((item, index) => (
      <ImageLoader
        key={item.name + index}
        src={item.url}
        alt={data.product.name}
        width={67}
        height={67}
        style={{ width: "100%", height: "auto" }}
      />
    ));
    return thumbList;
  };

  const priceDifference = data.product?.price - data.product?.discount || 0;

  return (
    <div className={classes.container}>
      <div className="row">
        <div className="col-lg-6 p-0">
          <div className={classes.slider}>
            <div className={classes.image_container_main}>
              <Carousel
                showArrows={false}
                showThumbs={true}
                showIndicators={false}
                renderThumbs={thumbs}
                showStatus={false}
                emulateTouch={true}
                preventMovementUntilSwipeScrollTolerance={true}
                swipeScrollTolerance={50}
                selectedItem={selectedImage}
              >
                {data.product.gallery.map((item, index) => (
                  <InnerImageZoom
                    key={item.name + index}
                    src={item.url}
                    className={classes.magnifier_container}
                    fullscreenOnMobile={true}
                  />
                ))}
              </Carousel>
            </div>
          </div>
        </div>
        <div className="col-lg-6 p-0">
          <div className={classes.details}>
            <p className={classes.unit}>
              {data.product.unitValue} {data.product.unit}
            </p>
            <h1 className={classes.heading}>{data.product.name}</h1>
            <hr />
            <div>
              {discountPrice > price && (
                <p className={classes.price_ori}>
                  {settings.settingsData.currency.symbol}
                  {discountPrice.toFixed(2)}
                </p>
              )}
              <p className={classes.price}>
                {settings.settingsData.currency.symbol}
                {price.toFixed(2)}
              </p>
            </div>
            <p className={classes.description}>
              {data.product.shortDescription}
            </p>
            {data.product.type === "variable" && (
              <div>
                {data.product.variants.length > 0 && (
                  <VarientView
                    varients={data.product.variants}
                    basePrice={data.product.discount}
                    updateRootVarient={setVariant}
                    updatePrice={setPrice}
                    updateStockInfo={setStockAv}
                    imageIndex={setSelectedImage}
                    updateDiscountPrice={setDiscountPrice}
                  />
                )}
              </div>
            )}
            <div className={classes.category}>
              <p className={classes.section_heading}>{t("categories")}</p>
              {data.product.categories.map((category, index) => (
                <span key={index} className={classes.category_list}>
                  {category.replace(/-/g, " ")}
                </span>
              ))}
            </div>
            <div className={classes.cart_section}>
              <p className={classes.section_heading}>QTY</p>
              <div className={classes.number_input}>
                <button
                  onClick={stepDownQty}
                  className={classes.minus}
                ></button>
                <input
                  className={classes.quantity}
                  ref={quantityAmount}
                  min="1"
                  max={
                    data.product.quantity === -1
                      ? 100000
                      : data.product.quantity
                  }
                  defaultValue="1"
                  type="number"
                  disabled
                />
                <button onClick={stepUpQty} className={classes.plus}></button>
              </div>
              <div className={classes.button_container}>
                {stockAv ? (
                  <button
                    className={classes.cart_button}
                    onClick={() => addItemToCart()}
                  >
                    {t("add_to_cart")}
                  </button>
                ) : (
                  <button className={classes.cart_button} disabled>
                    {t("out_of_stock")}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
