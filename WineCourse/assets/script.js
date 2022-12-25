    var prodDescMaxHeight = 180;
    var readMoreText = "Докладніше";
    var readLessText = "Сховати";
    function initReadMoreText(el, text) {
        let allText = '<p>' + htmlDecode(text).trim().split(/\r?\n/).join('</p><p>') + '</p>';
        el.html(allText);
        el.css('height', '100%').css('max-height', '100%');
        if(el.outerHeight() > 400) {
            el.siblings('.readMore').removeClass('d-none').text(readMoreText);
            el.css('height', prodDescMaxHeight);
        } else {
            el.siblings('.readMore').addClass('d-none').text(readMoreText);
        }
    }

    //for category params to category path
    (function() {
        let queryString = document.location.search;
        let urlParams = new URLSearchParams(queryString);
        let urlLng = '';
        if(urlParams.has('category')) {
            urlLng += '/category/' + urlParams.get('category').replace(/[^-\d]+/, '');
            urlParams.delete('category');
        } else {
            urlLng = document.location.pathname;
        }
        let urlParamsStr = urlParams.toString().length ? ('?' + urlParams.toString()) : '';
        history.replaceState({}, null, document.location.origin + urlLng + urlParamsStr);
    })();


    window.addEventListener('load', function() {
                                    let nextPageBlock = $('.nextPage');
            nextPageBlock.data('autoload', false);


            function isOnScreen(element) {
                let elementOffsetTop = element.offset().top;
                let elementHeight = element.height();
                let screenScrollTop = $(window).scrollTop();
                let screenHeight = $(window).height();
                let scrollIsAboveElement = elementOffsetTop + elementHeight - screenScrollTop >= 0;
                let elementIsVisibleOnScreen = screenScrollTop + screenHeight - elementOffsetTop >= 0;
                return scrollIsAboveElement && elementIsVisibleOnScreen;
            }

            let tmpProdCard = `            <div class="col mb-4" data-category="{categoryId}">
                <a href="https://winecourse.wayforpay.shop/prod/{prodId}" class="card w-100 m-0 toBasket"
                     data-id="{prodId}"
                     data-name="{prodName}"
                     data-price="{prodPrice}"
                     {data-prodPriceDiscount}
                     data-quantity="1"
                     onclick="return false;"
                 >
                    <div class="card-img-top">
                        <img src="{prodImage}" alt="{prodName}" loading="lazy">
                    </div>
                    <div class="card-body">
                        <div class="card-desc">
                            <div class="title" title="{prodName}">{prodName}</div>
                            <div class="price formatted-price">
                                {prodPriceNormalize}
                            </div>
                        </div>
                        <div class="card-basket"></div>
                    </div>
                    {badges}
                    {ended}
                </a>
            </div>`;

            $('.btn-category').on('click', function (e) {
                $('.btn-category').removeClass('active');
                let categoryId = $(e.currentTarget).data('category');
                $(e.currentTarget).addClass('active');
                $('#categoriesSelect').val(categoryId).change();
            });

            $('#dropdownCategory ~ .dropdown-menu .dropdown-item').on('click', function (e, search) {
                let categoryId = +$(this).data('value');
                if(+categoryId === +$('#categoriesSelect').val() && $('.search-collapsed input').eq(0).data('search-value').length === 0) {
                    return;
                }
                $('.extend-block').hide();
                $(this).addClass('active').siblings('.dropdown-item').removeClass('active');
                $('#dropdownCategory').text($(this).text());
                $('#categoriesSelect').val(categoryId).trigger('change', search);
            });

            $('#categoriesSelect').on('change', function (e, search) {
                nextPageBlock.css({opacity: 0}).data('autoload', false);
                nextPageBlock.find('button').css({cursor: 'auto'});
                let categoryId = $(e.currentTarget).val();
                let categoryName = $(e.currentTarget).find('option:selected').text();
                loadProds(categoryId, 1, true, search);
                $('.btn-category').removeClass('active');
                $('.btn-category[data-category="' + categoryId + '"]').addClass('active');
                $('#dropdownCategory').text(categoryName);
                $('#dropdownCategory').siblings('.dropdown-menu').find('.dropdown-item').removeClass('active');
                $('#dropdownCategory').siblings('.dropdown-menu').find('.dropdown-item[data-value="'+categoryId+'"]').addClass('active');
                $('h1').text(categoryName).removeClass('d-none');
                $('#carouselControls').fadeOut(200, function() {
                    $(this).addClass('d-none');
                });
                $('h1.h1').parent().removeClass('d-none');
                $('.search-collapsed input').val('').data('search-value', search || '');
                $('#searchMobile .search-collapsed input').css({padding: '16px 38px'});
            });

            $('#btnNextCount').on('click', function () {
                let page = nextPageBlock.data('next-page');
                let categoryId = $('.btn-category.active').data('category');
                let hasNext = $('#btnNextCount').closest('.nextPage').data('hasNext');
                if(hasNext) {
                    loadProds(categoryId, page, false);
                }
            });

            $('#btnNextAll').on('click', function () {
                nextPageBlock.data('loading', true);
                nextPageBlock.data('autoload', true);
                nextPageBlock.css({opacity: 0});
                nextPageBlock.find('button').css({cursor: 'auto'});
                $('#btnNextCount').trigger('click');
                $(window).scroll(function (e) {
                    if(!nextPageBlock.data('hasNext') || !nextPageBlock.data('autoload')) {
                        return;
                    }
                    if (isOnScreen($('footer')) && !nextPageBlock.data('loading')) {
                        nextPageBlock.data('loading', true);
                        $('#btnNextCount').trigger('click');
                    }
                });
            });

            $(document).on('loadProds', function(e, categoryId, page, removePrevius, search) {
                loadProds(categoryId, page, removePrevius, search);
            });

            let loadProds = function (categoryId, page, removePrevius, search) {
                let cardsDesk = $('#cardsDesk');
                let cards = cardsDesk.find('.col');
                let sort = $('#dropdownSort').data('sort') || '';
                let endedBadge = '<div class="ended-wrapper"><div class="badge-ended">Розпродано</div></div>';
                // let search = search || $('.search-collapsed input').eq(0).val().trim();
                let loader = $('<div class="cart-loader" style="position: relative; margin-top: -10px; opacity: 0;"><div class="dot-floating"></div></div>');
                categoryId = categoryId || 0;
                if(removePrevius) {
                    nextPageBlock.animate({opacity: 0}, 50, function () {
                        loader.css({opacity: 1})
                    });
                    nextPageBlock.find('button').css({cursor: 'auto'});
                } else {
                    loader.css({opacity: 1})
                }
                cardsDesk.before(loader);

                let queryString = document.location.search;
                let urlParams = new URLSearchParams(queryString);
                urlParams.delete('category');
                if(sort.length) {
                    urlParams.set('sort', sort);
                } else {
                    urlParams.delete('sort');
                }
                if(search && search.length) {
                    urlParams.set('search', search);
                } else {
                    urlParams.delete('search');
                }
                let urlLng = '';
                if(+categoryId !== 0) {
                    urlLng += '/category/' + categoryId;
                    let categorySlug = $('#categoriesSelect').find('option:selected').data('slug');
                    if(categorySlug) {
                        urlLng += '-' + categorySlug;
                    }
                }
                let urlParamsStr = urlParams.toString().length ? ('?' + urlParams.toString()) : '';

                history.replaceState({}, null, document.location.origin + urlLng + urlParamsStr);


                nextPageBlock.data('hasNext', false);
                $('body').css({overflowY: 'hidden'});
                if(removePrevius) {
                    cardsDesk.css({opacity: 0});
                }
                $('#searchResultText').hide();
                $.ajax({
                    url: '/shop/default/load-prods',
                    type: 'post',
                    dataType: 'json',
                    data: {
                        categoryId: categoryId || 0,
                        page: page || 1,
                        sort: sort,
                        search: search,
                        lng: 'uk',
                        _csrf: 'DNn-M-0PB_em2B_LrVzGTuY7HAjByhBiA1xUTuWVOvGCyGZ39YvI6pmypx2jEJe1UieztI3hbcveh-ifff0o7g=='
                    },
                })
                    .done(function (data) {
                        if (data !== undefined && data.status) {
                            if(removePrevius) {
                                cards.remove();
                            }
                            $('#dropdownSort').show();
                            if(data.items.length === 0) {
                                let resultMsg = 'За вашим запитом "<b>{search}</b>" нічого не знайдено';
                                $('#searchResultText').html('<div class="col col-12 col-xl-12 mb-4">' + resultMsg.replace('{search}', search) + '</div>').show();
                                $('#dropdownSort').hide();
                            } else if(search && search.length) {
                                let resultMsg = 'За вашим запитом "<b>{search}</b>" знайдено {n} {products}';
                                if(+String(data.total).slice(-1) === 1) {
                                    resultMsg = resultMsg.replace('{products}', 'товар');
                                } else if(data.total%1 === 0 && [2,3,4].indexOf(+String(data.total).slice(-1)) !== -1 ) {
                                    resultMsg = resultMsg.replace('{products}', 'товара');
                                } else if(data.total%1 === 0 && +String(data.total).slice(-1) > 4 ) {
                                    resultMsg = resultMsg.replace('{products}', 'товарів');
                                } else {
                                    resultMsg = resultMsg.replace('{products}', 'товара');
                                }
                                $('#searchResultText').html('<div class="col col-12 col-xl-12 mb-4">' + resultMsg.replace('{search}', search).replace('{n}', data.total) + '</div>').show();
                            }
                            for (const i in data.items) {
                                let isEnded = +data.items[i].limited === 1 && +data.items[i].totalRemaining === 0;
                                let tmpl = tmpProdCard;
                                tmpl = tmpl.replace(new RegExp('{categoryId}', 'g'), data.items[i].categoryId);
                                tmpl = tmpl.replace(new RegExp('{prodId}', 'g'), data.items[i].id);
                                tmpl = tmpl.replace(new RegExp('{prodName}', 'g'), $('<p>' + data.items[i].name + '</p>').text());
                                tmpl = tmpl.replace(new RegExp('{prodPrice}', 'g'), data.items[i].mainPrice);
                                tmpl = tmpl.replace(new RegExp('{prodImage}', 'g'), data.items[i].image || '/img/noprodimage-light.svg');
                                tmpl = tmpl.replace(new RegExp('{ended}', 'g'), isEnded ? endedBadge : '');

                                let badges = [];
                                if(!data.items[i].mainPriceDiscount) {
                                    let prodPriceNormalize = Utils.renderPrice(data.items[i].mainPrice, data.items[i].mainCurrency);
                                    tmpl = tmpl.replace(new RegExp('{prodPriceNormalize}', 'g'), prodPriceNormalize);
                                    tmpl = tmpl.replace(new RegExp('{data-prodPriceDiscount}', 'g'), '');
                                } else {
                                    let prodPriceDiscountNormalize = Utils.renderDiscountPrice(data.items[i].mainPrice, data.items[i].mainPriceDiscount, data.items[i].mainCurrency);
                                    tmpl = tmpl.replace(new RegExp('{prodPriceNormalize}', 'g'), prodPriceDiscountNormalize);
                                    tmpl = tmpl.replace(new RegExp('{data-prodPriceDiscount}', 'g'), 'data-price="' + data.items[i].mainPriceDiscount + '"');
                                    badges.push('<div class="badge-discount"><img src="/img/icons/discount-icon.png" alt="discount"></div>');
                                }
                                tmpl = tmpl.replace(new RegExp('{badges}', 'g'), badges.join(''));

                                tmpl = $(tmpl).addClass('new').css({dispaly: 'none'});
                                cardsDesk.append(tmpl);
                            }
                            if(removePrevius) {
                                cardsDesk.fadeIn(500, function () {
                                    $('body').css({overflowY: ''});
                                });
                            }
                            cardsDesk.find('.col.new').fadeIn(500, function () {
                                $(this).removeClass('new');
                                $('body').css({overflowY: ''});
                            });
                            if(data.nextCnt) {
                                if(nextPageBlock.data('autoload') === false) {
                                    nextPageBlock.animate({opacity: 1}, 500, function () {
                                        $(this).css('height', 'initial');
                                    });
                                    nextPageBlock.find('button').css({cursor: 'pointer'});
                                }
                                nextPageBlock.data('next-page', +data.page + 1).find('.cntNumber').text(data.nextCnt);
                                nextPageBlock.data('hasNext', true);
                            } else {
                                nextPageBlock.css({opacity: 0});
                                nextPageBlock.find('button').css({cursor: 'auto'});
                                nextPageBlock.data('hasNext', false);
                                nextPageBlock.data('autoload', false);
                            }
                        }
                        nextPageBlock.data('loading', false);
                        cardsDesk.siblings('.cart-loader').remove();
                        cardsDesk.animate({opacity: 1}, 200);
                    })
                    .fail(function () {
                        if(removePrevius) {
                            cards.remove();
                        }
                        cardsDesk.fadeIn(500, function () {
                            $('body').css({overflowY: ''});
                        });
                        nextPageBlock.data('loading', false);
                        cardsDesk.siblings('.cart-loader').remove();
                        cardsDesk.animate({opacity: 1}, 200);
                    });
            }

            $('#sortCardsDesk .w-collapse-container').on('click', function () {
                if(!$(this).hasClass('show')) {
                    $(this).addClass('show').siblings('.w-collapse-container').removeClass('show');
                }
                if($(window).width() < 768) {
                    $(this).siblings('.w-collapse-container').removeClass('show');
                }
            });

            $("#sortCardsDesk .dropdown").on('show.bs.dropdown', function (e) {
                $('#sortCardsDesk .w-collapse-container').removeClass('show');
                $('#sortCardsDesk .sort-collapsed').addClass('show');
            });

            $('#sortCardsDesk').on('click', '#dropdownSort ~ .dropdown-menu .dropdown-item', function (e) {
                e.preventDefault();
                e.stopPropagation();
                let value = $(this).data('value');
                let text = $(this).text();
                $('#dropdownSort').html('<span class="icon sort-icon"></span>' + text).data('sort', value);
                let categoryId = $('.btn-category.active').data('category');
                if($('#dropdownSort').closest('.dropdown').hasClass('show')) {
                    $('#dropdownSort').dropdown('toggle');
                }

                let search = $('.search-collapsed input').eq(0).data('search-value').trim();
                loadProds(categoryId, 1, true, search);
            });

            if($(window).width() < 768 && !$('#sortCardsDesk .w-collapse-container').hasClass('show')) {
                $('#sortCardsDesk .category-collapsed').addClass('show');
            }


        $(document).on('click', '.card-basket', function(e) {
            // e.preventDefault();
            // e.stopPropagation();
        });

        $(document).on('click', ".readMore", function(e) {
            e.preventDefault();
            let prodDesc = $(".prod-desc");
            if ($(this).text() === readMoreText ) {
                $(".readMore").text(readLessText);
                prodDesc
                    .css({
                        "height": prodDesc.height(),
                        "max-height": 9999
                    })
                    .animate({
                        "height": '100%'
                    }, 600);
            } else {
                $(".readMore").text(readMoreText);
                prodDesc
                    .css({
                        "height": '100%',
                    })
                    .animate({
                        "height": prodDescMaxHeight,
                        "max-height": prodDescMaxHeight
                    }, 600);
            }
        });

        
        $(document).myCart('.toBasket', {
            classCartIcon: 'shopping-basket',
            classCartBadge: 'basket-count',
            classProductRemove: 'prod-remove',
            classProductQuantity: 'prod-amount',
            classCartProduct: 'cart-prod',
            classCheckoutCart: 'toPay',
            idCartModal: 'modalCart',
            idCartTable: 'cartTable',
            idGrandTotal: 'total-sum',
            idEmptyCartMessage: 'empty-cart-message',
            pauseBeforeChangeCartBadge: 1000,
            isSumHtml: true,
            sessionId: 'thsemgvbf01qoqjv159mlvk77s',
            csrfParam: '_csrf',
            csrfToken: 'DNn-M-0PB_em2B_LrVzGTuY7HAjByhBiA1xUTuWVOvGCyGZ39YvI6pmypx2jEJe1UieztI3hbcveh-ifff0o7g==',


            checkoutCart: function(products, totalPrice) {
                let isValidForm = false;
                if(validateFormToPay !== undefined && typeof validateFormToPay === 'function') {
                    isValidForm = validateFormToPay();
                }

                if(isValidForm && saveCart !== undefined && typeof saveCart === 'function') {
                    saveCart(products, totalPrice);
                }

                return false;
            },

            showModalProdToCart: function($target, $calbackAfter, $callbakAddToCart) {
                                if(intervalViewProd) {
                    clearInterval(intervalViewProd);
                }
                var modalProdToCart = $('#modalProdToCart');
                let queryString = document.location.search;
                let urlParams = new URLSearchParams(queryString);
                let prodId = $target.data('id');
                if(urlParams.has('prod')) {
                    urlParams.delete('prod');
                }
                let urlLng = '';
                let urlParamsStr = urlParams.toString().length ? ('?' + urlParams.toString()) : '';
                history.replaceState({}, null, document.location.origin + urlLng + '/prod/' + prodId + urlParamsStr);
                modalProdToCart.find('.cart #add-prod-to-cart').prop('disabled', true);
                $.ajax({
                    url: '/shop/default/get-prod-params?_sad=thsemgvbf01qoqjv159mlvk77s',
                    type: 'post',
                    dataType: 'json',
                    data: {
                        id: prodId,
                        lng: 'uk',
                        "_csrf": "DNn-M-0PB_em2B_LrVzGTuY7HAjByhBiA1xUTuWVOvGCyGZ39YvI6pmypx2jEJe1UieztI3hbcveh-ifff0o7g=="
                    }
                })
                    .done(function (data) {
                        if(data !== undefined && !$.isEmptyObject(data) && data.status) {
                            var urls = [
                                data.item.image,
                            ];
                            if(data.item.extImages.length) {
                                urls = urls.concat(data.item.extImages);
                            }
                            let myGallery = $('#myGallery').attr({class:'', style:''}).empty();
                            if(window.outerWidth > 767) {
                                myGallery.zoomy(urls, {alt: data.item.image_alt});
                            } else {
                                myGallery.slider(urls, {alt: data.item.image_alt});
                            }
                            var image = data.item.image;
                            var name = data.item.name;
                            let mods = data.item.mods;
                            var modsCnt = Object.values(mods).length;
                            let cartCurrency = $('#modalCart').data('currency');
                            let amountSelect = modalProdToCart.find('.cart .amount-select');

                            let firstModId = Object.keys(mods)[0];
                            let firstMod = mods[firstModId];
                            if(!data.item.modTypes || data.item.modTypes.length === 0) {
                                firstMod.desc = !!firstMod.desc ? firstMod.desc : data.item.desc;
                            }
                            modalProdToCart.find('.modal-header .prod-title').text(htmlDecode(data.item.name));
                            modalProdToCart.find('.cart').data('mods', mods);
                            modalProdToCart.find('.cart .prod-img').attr('src', data.item.image);
                            modalProdToCart.find('.cart #amount').val(1);
                            amountSelect.val(1);
                            let isFirst = true;
                            let firstAvailableModId = Object.keys(mods)[0];
                            let prodDesc = mods[firstAvailableModId].desc;
                            modalProdToCart.find('.cart').data('isLimited', data.item.isLimited);
                            for (var modId in mods) {
                                let isAvailable = !data.item.isLimited || +mods[modId].remaining > 0;
                                if (isFirst && +mods[modId].price > 0) {
                                    if(mods[modId].priceDiscount) {
                                        modalProdToCart.find('.cart #sum').html(Utils.renderDiscountPrice(mods[modId].price, mods[modId].priceDiscount, mods[modId].currency));
                                    } else {
                                        modalProdToCart.find('.cart #sum').html(Utils.renderPrice(mods[modId].price, mods[modId].currency));
                                    }
                                    modalProdToCart.find('.cart').data('id', modId);
                                    modalProdToCart.find('.cart').data('price', mods[modId].price);
                                    modalProdToCart.find('.cart').data('priceDiscount', mods[modId].priceDiscount || '');
                                    modalProdToCart.find('.cart').data('currency', mods[modId].currency);
                                    modalProdToCart.find('.cart').data('hasProdLink', data.item.hasProdLink);
                                    modalProdToCart.find('.cart #prodEndedText').remove();
                                    modalProdToCart.find('.cart .quantity').removeClass('d-none');
                                    modalProdToCart.find('.cart label[for="amount"]').removeClass('d-none');
                                    amountSelect.removeClass('d-none').empty();
                                    modalProdToCart.find('.cart #add-prod-to-cart').prop('disabled', false);
                                    modalProdToCart.find('.cart #amount').removeAttr('max');
                                    if(data.item.isLimited) {
                                        if(mods[modId].remaining > 0) {
                                            modalProdToCart.find('.cart #amount').attr('max', mods[modId].remaining);
                                            let maxOptions = mods[modId].remaining > 20 ? 20 : mods[modId].remaining;
                                            for (let i = 1; i <= maxOptions; i++) {
                                                amountSelect.append('<option value="' + i + '">' + i +'</option>')
                                            }
                                        } else {
                                            let endedText = '<label class="text-danger" id="prodEndedText">';
                                            if(+mods[modId].remainingOrigin > +mods[modId].remaining) {
                                                endedText += 'Товар вже додано до кошику<br />';
                                            }
                                            endedText += 'Товар закінчився';
                                            endedText += '</label>';
                                            modalProdToCart.find('.cart .quantity').addClass('d-none').before(endedText);
                                            amountSelect.addClass('d-none');
                                            modalProdToCart.find('.cart #add-prod-to-cart').prop('disabled', true);
                                        }
                                    } else {
                                        for (let i = 1; i <= 20; i++) {
                                            amountSelect.append('<option value="' + i + '">' + i + '</option>')
                                        }
                                    }

                                    if(data.item.hasProdLink) {
                                        amountSelect.prop('disabled', true);
                                        modalProdToCart.find('.cart #amount').attr('max', 1);
                                    } else {
                                        amountSelect.prop('disabled', false);
                                    }

                                    modalProdToCart.find('.cart #amount').trigger('change');
                                    isFirst = false;
                                }
                                if(isAvailable) {
                                    firstAvailableModId = modId;
                                    prodDesc = mods[modId].desc;
                                }
                            }
                            let isExtDesc = false;
                            modalProdToCart.find('.extDesc .span-link').attr('href', '').addClass('d-none');
                            if(data.item.descLink) {
                                modalProdToCart.find('.extDesc .descLink').attr('href', data.item.descLink).removeClass('d-none');
                                isExtDesc = true;
                            }
                            if(data.item.descVideo) {
                                modalProdToCart.find('.extDesc .descVideo').attr('href', data.item.descVideo).removeClass('d-none').css({'float':'right'});
                                if(!isExtDesc) {
                                    modalProdToCart.find('.extDesc .descVideo').css({'float':'left'});
                                }
                                isExtDesc = true;
                            }
                            if(isExtDesc) {
                                modalProdToCart.find('.extDesc').removeClass('d-none');
                                prodDescMaxHeight = urls.length > 1 ? 265 : 190 ;  // urls - адреса картинок в слайдере
                            } else {
                                modalProdToCart.find('.extDesc').addClass('d-none');
                                prodDescMaxHeight = urls.length > 1 ? 305 : 235;  // urls - адреса картинок в слайдере
                            }

                            if(data.item.article && data.item.article.length) {
                                let articleText = 'Код товару: ';
                                modalProdToCart.find('.article').text(articleText + data.item.article).removeClass('d-none');
                            } else {
                                modalProdToCart.find('.article').text('').addClass('d-none');
                            }

                            modalProdToCart.find('.cart .prod-desc, .cart .readMore, .cart .extDesc').empty();
                            modalProdToCart
                                .on('shown.bs.modal', function () {
                                    initReadMoreText(modalProdToCart.find('.cart .prod-desc'), prodDesc);
                                })
                                .on('hidden.bs.modal', function () {
                                    let queryString = document.location.search;
                                    let urlParams = new URLSearchParams(queryString);
                                    if(urlParams.has('prod')) {
                                        urlParams.delete('prod');
                                    }
                                    let urlLng = '';
                                    let urlParamsStr = urlParams.toString().length ? ('?' + urlParams.toString()) : '';
                                    history.replaceState({}, null, document.location.origin + '/' + urlLng + urlParamsStr);
                                    $(this).find('.prod-desc').css({
                                        "height": 'auto',
                                        "max-height": prodDescMaxHeight
                                    });
                                });
                            setTimeout(function() {
                                modalProdToCart.modal('show');
                            }, 10);

                            $('#add-prod-to-cart').off('click').on('click', function () {

                                modalProdToCart.one('hidden.bs.modal', function () {

                                    let modalProdToCart_cart = modalProdToCart.find('.cart');
                                    let id = modalProdToCart_cart.data('id');
                                    let originPrice = modalProdToCart_cart.data('price');
                                    let priceDiscount = modalProdToCart_cart.data('priceDiscount');
                                    let price = priceDiscount ? priceDiscount : originPrice;
                                    let hasProdLink = modalProdToCart_cart.data('hasProdLink');
                                    let cartHasProdLink = $('#modalCart').data('hasProdLink');
                                    let currency = mods[id].currency;
                                    let quantity = modalProdToCart_cart.find('#amount').val();

                                    if(!!cartCurrency && cartCurrency !== currency) {
                                        $('#modalErrors').modal('show').find('.modal-body').html('В кошик можна додати тільки товари з однаковою валютою. <br>На данний момент в кошику вже є товари з валютою: ' + cartCurrency);
                                        return false;
                                    }
                                    if(typeof cartHasProdLink !== 'undefined' && cartHasProdLink !== hasProdLink) {
                                        let textOnlyProduct = 'В кошик можна додати тільки товари однакового типу.';
                                        let textInfoProduct = 'На данний момент в кошику вже є інформаційні товари';
                                        let textUsualProduct = 'На данний момент в кошику вже є звичайні товари';
                                        $('#modalErrors').modal('show')
                                            .find('.modal-body').html(textOnlyProduct + '<br />' + (cartHasProdLink ? textInfoProduct : textUsualProduct));
                                        return false;
                                    } else if(hasProdLink) {
                                        let textProdAlreadyInCart = 'Товар вже додано до кошику';
                                        let prodLinkModIds = [].concat($('#modalCart').data('prodLinkModIds') || []);
                                        prodLinkModIds.push(+id);
                                        if (Utils.arrayGetUnique(prodLinkModIds).length !== prodLinkModIds.length) {
                                            $('#modalErrors').modal('show')
                                                .find('.modal-body').html(textProdAlreadyInCart);
                                            return false;
                                        }
                                    }
                                    $callbakAddToCart(id, name, originPrice, quantity, image, mods[id], modsCnt, hasProdLink);
                                    $calbackAfter($target);
                                    if(typeof fbq === "function") {
                                        fbq('track', 'AddToCart', {content_name: name, currency: currency, value: price});
                                    }
                                    if(typeof gtag === "function") {
                                        let item = {
                                            id: id,
                                            name: name,
                                            price: price,
                                            quantity: quantity,
                                        };
                                        if(modsCnt > 1) {
                                            item.variant = mods[id].name;
                                        }
                                        gtag('event', 'add_to_cart', {
                                            currency: currency,
                                            items: [item],
                                            value: price * quantity
                                        });
                                    }
                                }).modal('hide');
                            });

                            $('#modTypeWidget').empty();
                            $.ajax({
                                url: '/shop/product/get-mod-type-widget',
                                type: 'post',
                                dataType: 'json',
                                data: {
                                    prod: data.item,
                                }
                            })
                            .done(function (data) {
                                if(data.html) {
                                    $('#modTypeWidget').append(data.html);
                                    initModType(firstAvailableModId);
                                }
                            });
                        }
                    });
            },

            clickOnAddToCart: function($addTocartBtn){
                var $cartIcon = $(".shopping-basket");
                var $basketImg = $addTocartBtn.find('.card-basket');
                let mainPositionTop = $basketImg.offset().top - $(window).scrollTop();
                let mainPositionLeft = $basketImg.offset().left;
                let imgUrlMatch = $basketImg.css('background-image').match(/url\("?(.*)"?\)/);
                var $image = $('<img src="' + (imgUrlMatch[1] || '') + '"/>')
                    .css({
                        "position": "fixed",
                        "z-index": "1050",
                        "top": mainPositionTop,
                        "left": mainPositionLeft,
                        'background-color': '#ffffff',
                        'border-radius': '50%',
                        'height': $basketImg.height() +'px',
                        'width': $basketImg.width() + 'px',
                    });

                $addTocartBtn.prepend($image);
                var position = $cartIcon.position();

                $image
                    .animate({
                        top: mainPositionTop + 100,
                        left: mainPositionLeft,
                        height: ($image.height() * 2) +'px',
                        width: ($image.width() * 2) + 'px',
                    }, 200 , "linear")
                    .animate({
                        top: position.top + ($cartIcon.height() / 2),
                        left: position.left + ($cartIcon.width() / 2),
                        opacity: 0.3,
                        height: '10px',
                        width: '10px',
                    }, 500 , "swing", function() {
                        $image.remove();
                    });

            },

            renderCartProd: function(id, price, renderedPrice, image, name, quantity, mod, modsCnt, hasProdLink) {
                if(hasProdLink) {
                    mod.remaining = 1;
                    mod.remainingOrigin = 1;
                }
                if(mod.priceDiscount) {
                    renderedPrice = Utils.renderDiscountPrice((mod.price * quantity), (mod.priceDiscount * quantity), mod.currency);
                } else {
                    renderedPrice = Utils.renderPrice((mod.price * quantity), mod.currency);
                }

                let modTypeItem = '';
                if(+modsCnt > 1) {
                    if(mod.typeValues && Object.keys(mod.typeValues).length > 1) {
                        let cnt = 1;
                        for (const modTitle in mod.typeValues) {
                            let modTypeValue = mod.typeValues[modTitle]
                            modTypeItem += '                <div class="form-group row">\n' +
                                      '                    <label for="volume-' + id + '-' + cnt + '" class="col-form-label col-5">' + modTitle + '</label>\n' +
                                      '                    <input type="text" readonly class="form-control-plaintext col-7" id="volume-' + id + '-' + cnt + '" value="' + modTypeValue + '">\n' +
                                      '                </div>\n';
                            cnt++;
                        }
                    } else {
                        modTypeItem = '                <div class="form-group row">\n' +
                                  '                    <label for="type-' + id + '" class="col-form-label col-5">' + (mod.modTitle || 'Тип') + '</label>\n' +
                                  '                    <input type="text" readonly class="form-control-plaintext col-7" id="volume-' + id + '" value="' + (mod.name.length ? mod.name : '') + '">\n' +
                                  '                </div>\n'
                    }
                }

                let html = $(
                    '<div class="cart-prod" data-id="' + id + '" data-price="' + mod.price + '" data-currency="' + (!!mod.currency ? mod.currency : 'UAH') + '">\n'+
                    '        <img src="' + image + '" alt="" class="prod-img">\n'+
                    '        <div class="prod-params w-100">\n'+
                    '            <span class="prod-title">' + name + '</span>\n'+
                    '            <form class="mt-3">\n'+
                    modTypeItem +
                    '                <div class="form-group row">\n'+
                    '                    <div class="col-4 p-0">\n'+
                    '                        <input type="number" class="form-control col-7 prod-amount" id="amount-' + id + '" min="1" value="' + quantity + '" max="' + (+mod.remaining > 0 ? mod.remaining : 999) + '">\n'+
                    '                        <select class="form-control amount-select" onchange="changeAmountSelect(this)"  value="' + quantity + '"></select>\n'+
                    '                    </div>\n'+
                    '                    <div class="col-8 p-0">\n'+
                    '                        <span type="text" readonly class="form-control-plaintext sum formatted-price" id="sum-' + id + '">' + renderedPrice + '</span>\n'+
                    '                    </div>\n'+
                    '                </div>\n'+
                    '            </form>\n'+
                    '        </div>\n'+
                    '        <button type="button" class="close prod-remove"></button>\n'+
                    '    </div>');

                let maxQuantity = +quantity > 20 ? +quantity : 20;
                maxQuantity = +maxQuantity > 999 ? 999 : +maxQuantity;
                maxQuantity = +maxQuantity > +mod.remainingOrigin ? +mod.remainingOrigin : +maxQuantity;
                if(hasProdLink) {
                    maxQuantity = 1;
                    html.find('.amount-select').closest('.form-group').addClass('d-none');
                } else {
                    html.find('.amount-select').closest('.form-group').removeClass('d-none');
                }

                if(mod.priceDiscount) {
                    html.data('priceDiscount', mod.priceDiscount);
                }

                let amountSelect = html.find('.amount-select');
                for(let i = 1; i <= maxQuantity; i++) {
                    amountSelect.append('<option value="' + i + '"' + (+quantity === i ? ' selected' : '') + '>' + i + '</option>');
                }
                if(+quantity > +maxQuantity) {
                    amountSelect.append('<option value="' + quantity + '" selected>' + quantity + '</option>');
                }
                return html;
            },

            renderEmptyCartMessage: function () {
                let html =
                    '<div id="empty-cart-message">\n'+
                    '    <div>Ваш кошик ще порожній</div>\n'+
                    '    <div>Давайте що небудь виберемо</div>\n'+
                    '    <div class="empty-cart"></div>\n'+
                    '    <button class="btn btn-primary toShoping" data-dismiss="modal">Обрати</button>\n'+
                    '</div>\n';
                return html;
            },

            afterRemoveProd: function ($countProds) {
                // console.log('afterRemoveProd');
                if($countProds === 0) {
                    $('#modalCart').removeClass('double-modal').find('.checkout-dialog').hide();
                    $('body').removeClass('double');
                }
            },

            callbackAfterLoadEvents: function () {
                if($('#viewProd').length) {
                    intervalViewProd = setInterval(function () {
                        $('#viewProd').find('.toBasket').click();
                    }, 100);
                }
            }
        });

        $('#modalCart').on('change', '.prod-amount', function() {
            let val = $(this).val();
            if(isNaN(val) || +val < 1) {
                $(this).val(1).trigger('change');
            }
        });

        $('#modalProdToCart').on('change', '#amount', function() {
            let val = $(this).val();
            if(isNaN(val) || +val < 1) {
                $(this).val(1).trigger('change');
            }
        });

        // запуск проверки статусов заказа
        setLoopCheckPayStatus();

        if(Cache.get('hasLimitedProd')) {
            let orderRef = Cache.get('orderRef');
            let checkAbandonedCartInterval = setInterval(function() {
                checkAbandonedCart(orderRef);
            }, 30000);

            let checkAbandonedCart = function(orderRef) {
                $.ajax({
                    url: '/shop/default/check-abandoned-cart?_sad=thsemgvbf01qoqjv159mlvk77s',
                    type: 'post',
                    dataType: 'json',
                    data: {orderRef}
                })
                    .done(function (data) {
                        if (data && data.status && data.resetCart) {
                            clearInterval(checkAbandonedCartInterval);
                            resetCart();
                        }
                    });
            }
            let resetCart = function() {
                console.log('resetCart');
                $(document).trigger('checked.cart');
                Cache.remove('hasLimitedProd');
                Cache.remove('orderRef');
                $('#formCheckout').trigger("reset");
                $('#modalCart').data('currency', '').data('sum', '').data('items', '');
            }
        }

        });


