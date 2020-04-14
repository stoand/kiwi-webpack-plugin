# SPC-examples-order_donuts
partof: REQ-purpose
###

## [[.title_bar]]

The name of the fictitous company is `Yum Donuts`.

This name will be displayed in a title bar that is at the top of the page.

## [[.start]]

Before the customer can select what they want to order,
the customer's zip code number is needed to get their approximate location.

Once the customer has entered their zip code they will be able to enter their street name.

The list of street names is not real and is hardcoded to this:

```
Ioanni Kapodistria	
Kentavrou 	
Korytsas 	
Lamprou Katsoni 	
Lordou Vyronos 	
Mantos Mavrogenous 	
Nikitara 	
Palaion Patron Germanou 	
Patriarchou Grigoriou
Petrompei Mavromichali 	
Porfyriou Dikaiou
```

[[.tst-start_initially_hidden_street]]

The street name selector will not appear until a zip code has been entered.

[[.tst-start_continue]]

The user should be able to enter a zip code, select a street, and proceed to [[.menu]].

## [[.menu]]

Menu Options:

Base Topping
* Chocolate
* Powdered Sugar
* Glazing

Sprinkles (Optional)
* Chocolate
* Pink
* Blue

Cost per donut: 3 Eur

The customers will be able to create donuts and add them to the
order list.

[[.tst-menu_add_item]]

The user should be able to select a topping and sprinkles and see the donut
added to the order list.

[[.tst-menu_remove_item]]

The user should be able to remove indivitual items from the order list through a `(remove)` button.

[[.tst-menu_total_cost]]

The user should see the total cost increase after adding a donut.

[[.tst-menu_no_empty_order]]

If the order list is empty, the order button should be disabled.

[[.tst-menu_continue]]

The user should be able to continue to [[.finalize]] after adding an item and selecting the `Order` button.

## [[.finalize]]

Once the user has selected their order contents, they 
need to enter their first and last name,  full address, and phone number.

[[.tst-finalize_no_empty]]

No field can be empty.

[[.tst-finalize_phone_chars]]

The phone number can only contain numbers, spaces or '+'.

[[.tst-finalize_continue]]

The user should be able to fill out all fields and proceed to [[.confirmation]].

## [[.confirmation]]

The confirmation page should thank the user for ordering and display the
order contents and total cost.
