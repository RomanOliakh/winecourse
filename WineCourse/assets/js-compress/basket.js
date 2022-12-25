 var intervalViewProd;
    window.addEventListener('load', function() {

        $('.shopping-basket').click(function (e) {
            $('#modalCart').modal('show');
        });

        $('#checkout').on('click', function () {

            window.location.href = '/checkout';

        });

        $(document).on('prodTypeChange', function () {
            var cart = $('#modalProdToCart').find('.cart');
            var mods = cart.data('mods');
            var modId = cart.find('#volume').val() || $('#prod-volume').val();
            if(!mods || modId.length === 0) { return; }
            var quantity = cart.find('#amount').val();
            let amountSelect = cart.find('.amount-select');
            let isLimited = cart.data('isLimited');
            let price = mods[modId].priceDiscount ? mods[modId].priceDiscount : mods[modId].price;
            cart.find('#sum').html(Utils.renderPrice(parseFloat(price * quantity), mods[modId].currency));
            cart.data('id', modId);
            cart.data('price', mods[modId].price);
            cart.data('priceDiscount', mods[modId].priceDiscount || '');
            cart.data('currency', mods[modId].currency);
            cart.find('#prodEndedText').remove();
            if(cart.data('hasProdLink')) {
                cart.find('.quantity').addClass('d-none');
                cart.find('label[for="amount"]').addClass('d-none');
                amountSelect.addClass('d-none');
            } else {
                cart.find('.quantity').removeClass('d-none');
                cart.find('label[for="amount"]').removeClass('d-none');
                amountSelect.removeClass('d-none');
            }
            cart.find('#amount').val(1);
            amountSelect.empty();
            let remainingOrigin = mods[modId].remainingOrigin || 0;
            let remaining = mods[modId].remaining || 0;
            remaining = isLimited ? remaining : 999;
            if(+remaining > 0) {
                cart.find('#add-prod-to-cart').prop('disabled', false);
                if(+remaining < +quantity) {
                    cart.find('#amount').val(remaining);
                    cart.find('#sum').html(Utils.renderPrice(parseFloat(price * remaining), mods[modId].currency));
                }
                cart.find('#amount').attr('max', remaining).trigger('change');
                let maxOptions = +remaining > 20 ? 20 : +remaining;
                for (let i = 1; i <= +maxOptions; i++) {
                    amountSelect.append('<option value="' + i + '">' + i +'</option>')
                }
            } else {
                cart.find('#sum').html(Utils.renderPrice(price, mods[modId].currency));
                cart.find('.quantity').addClass('d-none');
                cart.find('label[for="amount"]').addClass('d-none');
                amountSelect.addClass('d-none');
                let endedText = '<label class="text-danger" id="prodEndedText">';
                if(+remainingOrigin > +remaining) {
                    endedText += 'Товар вже додано до кошику<br />';
                }
                endedText += 'Товар закінчився';
                endedText += '</label>';
                cart.find('.quantity').before(endedText);
                cart.find('#add-prod-to-cart').prop('disabled', true);
                for (let i = 1; i <= 20; i++) {
                    amountSelect.append('<option value="' + i + '">' + i +'</option>')
                }
            }
            cart.find('#amount').trigger('change');
            initReadMoreText(cart.find('.prod-desc'), mods[modId].desc);
        });

        changeAmountSelect = function(el) {
            let quantityBlock = $(el).siblings('.quantity');
            let inputEl = quantityBlock.find('input[type="number"]');
            let quantity = $(el).val();
            inputEl.val(quantity);
            inputEl.trigger("change");
        };

        $('#total-sum').on('DOMSubtreeModified', function () {
            let currency = $('#modalCart').data('currency');

            let deliveryCostBlock = $('.total-delivery.row');
            let deliverySumEl = $('#delivery-sum');
            let cartCurrency = $('#modalCart').data('currency');
            let deliverySum = 0;
            if($('input[name="delivery_option"]:checked').val() === 'delivery' && deliveryCost[cartCurrency]) {
                deliveryCostBlock.removeClass('d-none');
                deliverySumEl.html(Utils.renderPrice(deliveryCost[cartCurrency], cartCurrency)).data('sum', deliveryCost[cartCurrency]);
                deliverySum = parseFloat(deliveryCost[cartCurrency]);
            } else {
                deliveryCostBlock.addClass('d-none');
                deliverySumEl.html('').removeData('sum');
            }

            let totalCartSum = parseFloat($('#total-sum').data('sum'));

            if(!isNaN(deliverySum) && !isNaN(totalCartSum)) {
                let totalPriceCart = (deliverySum + totalCartSum).toFixed(2);
                $('#totalCartSum').val(deliverySum + totalCartSum).trigger('change');
                $('#total-sum-checkout').html(Utils.renderPrice(totalPriceCart, currency));

                // check minPrice
                let totalRow = $('#modalCart .modal-footer .total.row');
                let minPriceInfo = totalRow.find('.minPriceInfo');
                if(Object.keys(minCartPrice) && minCartPrice[currency]) {
                    minPriceInfo.find('.minPriceValue').text(minCartPrice[currency]);
                    minPriceInfo.find('.minPriceCurrency').text(currency);
                    if(+totalPriceCart < minCartPrice[currency]) {
                        totalRow.find('.checkout').prop('disabled', true);
                        minPriceInfo.removeClass('d-none');
                    } else {
                        totalRow.find('.checkout').prop('disabled', false);
                        minPriceInfo.addClass('d-none');
                    }
                } else {
                    minPriceInfo.addClass('d-none');
                    totalRow.find('.checkout').prop('disabled', false);
                }
            }
        })

        setTimeout(function () {
            $('#modalProdToCart #amount').on('change', function () {
                var cart = $(this).closest('.cart');
                var price = cart.data('price');
                var priceDiscount = cart.data('priceDiscount');
                var currency = cart.data('currency');
                var quantity = cart.find('#amount').val();
                if(priceDiscount) {
                    cart.find('#sum').html(Utils.renderDiscountPrice((price * quantity), (priceDiscount * quantity), currency));
                    cart.find('#myGallery').after('<div class="badge-discount prod-badge"><img src="/img/icons/discount-icon.png" alt="discount"></div>');
                } else {
                    cart.find('#sum').html(Utils.renderPrice(price * quantity, currency));
                    cart.find('.badge-discount.prod-badge').remove();
                }
            });
        }, 100);

        $(document).on('click', '#modalCart .toShoping', function () {
            let modalInfo = $('#modalInfo');
            if(modalInfo.length) {
                modalInfo.find('.close-info').trigger('click');
            }
        });

    });
