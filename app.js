var budgetController = (function(){
    
    var Expense = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }
    
    var Income = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
    }
    Expense.prototype.calcPercentage = function(totals){
        if(totals>0)
            this.percentage = Math.round((this.value/totals)*100);
        else
            this.percentage = -1;
    }
    Expense.prototype.getPercentage = function(){
        return this.percentage;
    }
    
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    }
    
    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(cur){
            sum += cur.value;
        });
        data.totals[type] = sum;
    }
    
    return {
        addItem: function(type, des, val){
            var newItem, id;
            var dataType = data.allItems[type];
            
            //ID creation
            if(dataType.length > 0)
                id = dataType[dataType.length - 1].id + 1;
            else
                id = 0;
            
            //Object creation
            if(type==='exp')
                newItem = new Expense(id, des, val);
            else
                newItem = new Income(id, des, val);
            
            dataType.push(newItem);
            return newItem;
        },
        
        deleteItem: function(type, id){
            var ids, index;
            ids = data.allItems[type].map(function(current){
                return current.id;
            });
            index = ids.indexOf(id);
            data.allItems[type].splice(index,1);
        },
        
        calculateBudget: function(){
            // calculate sum
            calculateTotal('exp');
            calculateTotal('inc');
            
            // calculate budget
            data.budget = data.totals.inc - data.totals.exp;
            
            // calculate percentage
            if(data.totals.inc>0){
                data.percentage = Math.round((data.totals.exp/data.totals.inc)*100);
            }
            else
                data.percentage = -1;
            
        },
        
        calculatePercentages: function(){
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            })
        },
        
        getPercentages: function(){
            var perc = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return perc;
        },
        
        getBudget: function(){
            return {
                budget: data.budget,
                percentage: data.percentage,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp
            };
        },
        
        testing: function(){
            console.log(data);
        }
    };
    
})();

var UIController = (function(){
    
    var DOMStrings = {
        inputType: '.add__type',
        inputBtn: '.add__btn',
        inputValue: '.add__value',
        inputDescription: '.add__description',
        expensesContainer: '.expenses__list',
        incomeContainer: '.income__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        budgetPercentage: '.budget__expenses--percentage',
        container: '.container',
        expLabelPerc: '.item__percentage',
        dateLabel: '.budget__title--month'
    };
    
    var formatNumber = function(num, type){
        var splitNum, int, dec;
        num = Math.abs(num);
        num = num.toFixed(2);
        splitNum = num.split('.');
        
        int = splitNum[0];
        
        if(int.length > 3){
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }
        
        dec = splitNum[1];
        
        return (type==='exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };
    
    var nodeListForEach = function(list,callback){
        for(var i =0; i < list.length; i++){
            callback(list[i],i);
        }
    };
    
    return{
        getInput: function(){
        return {
            type: document.querySelector(DOMStrings.inputType).value,
            description: document.querySelector(DOMStrings.inputDescription).value,
            value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            };
        },
        
        addListItem: function(obj, type){
            var html, newHtml, element;
            // 1. Create HTML string with placeholder text
            if(type === 'exp'){
                element = DOMStrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                
            }
            else if(type === 'inc'){
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            // 2. Replace placeholder text
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            
            // 3. Insert HTML into DOM
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
        },
        
        deleteListItem: function(selectorID){
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },
        
        clearFields: function(){
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function(current, index, array){
                current.value = "";
            });
            fieldsArr[0].focus();
        },
        
        displayBudget: function(obj){
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.expensesLabel).textContent = obj.totalExp;
            document.querySelector(DOMStrings.incomeLabel).textContent = obj.totalInc;
            
            if(obj.percentage > 0){
                document.querySelector(DOMStrings.budgetPercentage).textContent = obj.percentage + '%';
            }
            else
                document.querySelector(DOMStrings.budgetPercentage).textContent = '---';
        },
        
        displayPercentages: function(perc){
            var fields = document.querySelectorAll(DOMStrings.expLabelPerc);
            
            nodeListForEach(fields, function(current, index){
                if(perc[index]>0){
                    current.textContent = perc[index] + '%';
                }
                else
                    current.textContent = '---';
            })
        },
        
        displayMonth: function(){
            var now, month, months, year;
            now = new Date();
            months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ', ' + year;
        },
        
        changedType: function(){
            var fields = document.querySelectorAll(
                DOMStrings.inputType + ',' +
                DOMStrings.inputDescription + ',' +
                DOMStrings.inputValue
            );
            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus');
            });
            document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
            
        },
        
        getDOMStrings: function(){
            return DOMStrings;
        }
        
    };
    
    
})();

var controller = (function(budgetCtrl,UICtrl){
    
    var setupEventListeners = function(){
        var DOM = UICtrl.getDOMStrings();
        
        document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);
        document.addEventListener('keypress', function(event){
           if(event.keyCode === 13 || event.which ===13){
               ctrlAddItem();
           }
        });
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };
    
    var updateBudget = function(){
        var budget;
        //1. Calculate the budget
        budgetCtrl.calculateBudget();
        
        //2. Return the budget
        budget = budgetCtrl.getBudget();
        
        //3. Display budget on ui
        UICtrl.displayBudget(budget);
    }
    
    var updatePercentage = function(){
        var perc;
        // 1. Calculate percentage
        budgetCtrl.calculatePercentages();
        
        // 2. Read pecentage from budget controller
        perc = budgetCtrl.getPercentages();
        
        // 3. Display percentage
        UICtrl.displayPercentages(perc);
        
    }

    var ctrlAddItem = function(){
        //1. Get input
        var input = UICtrl.getInput();
        if(input.description!="" && !isNaN(input.value) && input.value>0){
            //2. Add new item to budgetController
            var newItem = budgetCtrl.addItem(input.type,input.description,input.value);

            //3. Add item to ui
            UICtrl.addListItem(newItem,input.type);

            //4. Clear the fields
            UICtrl.clearFields();

            //5. Calculate & update budget
            updateBudget();
            
            //6. Update percentage
            updatePercentage();
        }
    }
    var ctrlDeleteItem = function(event){
        var itemId, splitId, type, ID;
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if(itemId){
            
            splitId = itemId.split('-');
            type = splitId[0];
            ID = parseInt(splitId[1]);
            // Delete item from data structure
            budgetCtrl.deleteItem(type,ID);
            
            // Delete from UI
            UICtrl.deleteListItem(itemId);
            
            // Recalclulate budget and update ui
            updateBudget();
            
            // Update percentage
            updatePercentage();
        }
        
    }

    
    return {
        init: function(){
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                percentage: -1,
                totalInc: 0,
                totalExp: 0
            });
            setupEventListeners();
        }
    };
    
    
})(budgetController,UIController);

controller.init();