var budgetController = (function(){
  var Expense = function(id, description, value){
      this.id = id;
      this.description = description;
      this.value = value;
      this.percentage = -1;
      
  };
    Expense.prototype.calcPerc = function(totalInc){
        if(totalInc>0)
            {
              this.percentage = Math.round((this.value/totalInc)*100);
            }else{
                this.percentage = -1;
            }
                
    };
    
    Expense.prototype.getPerc = function(){
        return this.percentage;
    };
    var Income = function(id, description, value){
      this.id = id;
      this.description = description;
      this.value = value;
      
  }
    var calculateTotal = function(type){
        var sum=0;
      data.allitems[type].forEach(function(cur){
          sum += cur.value;
      });
        data.totals[type] = sum;
    }
    var data = {
        totals: {
            exp :0,
            inc :0
        },
        allitems:{
            inc:[],
            exp :[]
        },
        budget:0,
        percentage : -1
        
    }
    
    return{
        //Create expense or Income 
        createNewItem: function(type, des, val){
             var newItem ,ID ;
            //Create  incrementing Id with proper type inc or exp 
        if(data.allitems[type].length > 0)
            {
              ID= data.allitems[type][data.allitems[type].length - 1].id + 1
            }
            else{
             ID =0;   
            }
            //add the income/expense object to Array
            if(type ==='exp')
                {
                      newItem = new Expense(ID, des, val) ;
                }else if (type ==='inc'){
                     newItem = new Income(ID, des, val);
                }
            data.allitems[type].push(newItem);
            return newItem;
              
        },
        calculateBudget :function(){
            //Calculate Total Inc and Exp
            calculateTotal('inc');
            calculateTotal('exp');
            //calculate Budget
            data.budget = data.totals.inc - data.totals.exp;
            //calculate Percentage
            if(data.totals.inc >0){
                data.percentage = Math.round((data.totals.exp/data.totals.inc)*100);
            }else {
                data.percentage = -1;
            }
        },
        calculatePercentage : function(){

            data.allitems.exp.forEach(function(cur){
                cur.calcPerc(data.totals.inc);
            });

        },
        getPercentage : function(){
            var percArray;
            percArray=  data.allitems.exp.map(function(cur){
             return  cur.getPerc();
          });
            return percArray;
        
        },
        getBudget: function() {
        return {
            percentage : data.percentage,
            budget : data.budget,
            incomeTotal :data.totals.inc,
            expenseTotal :data.totals.exp
        }  
        },
        deleteBudgetItem : function(type,ID){
            var ids,index;
            ids =  data.allitems[type].map(function(current){
               return  current.id;
            });
            index = ids.indexOf(ID)
            if(index !== -1)
            {data.allitems[type].splice(index,1);
            }
        },
        testing:function(){
            return data;
        }
   
        
    }
})();
var UIController = (function(){
        var element;
        var DOMstrings =
            {
        inputType : '.add__type',
        inputDescription : '.add__description',
        inputValue : '.add__value',
        inputBtn : '.add__btn',
        inputExpenses : '.expenses__list',
        inputIncome : '.income__list',
        outputBudget :'.budget__value',
        outpuIncome :'.budget__income--value',
        outpuExpenses :'.budget__expenses--value',
        outputPercentage :'.budget__expenses--percentage',
        container : '.container',
        expPercentage:'.item__percentage',
        month : '.budget__title--month'
        }
        var formatNum = function(num, type){
            var numSplit,int,dec;
            //add + or - sign 
            //add a comma
            //toFixed 2.
            num = Math.abs(num);
            num = num.toFixed(2);
            numSplit = num.split('.');
            int = numSplit[0];
            if(int.length > 3)
                {//2345;-- 23456
                    int = int.substr(0,int.length - 3) + ',' + int.substr(int.length - 3,3);
                }
            dec = numSplit[1];
            
            return (type==='inc'? '+':'-') + ' ' + int +'.' + dec;
            
        };
        var NodeArry =function(list,callback){
                for(var i=0;i<list.length;i++){
                    callback(list[i],i);
                }
            }
    
    return {
        getInputs: function(){
            return{
                type : document.querySelector(DOMstrings.inputType).value,
                description : document.querySelector(DOMstrings.inputDescription).value,
                value : parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }

        },
        //Create a new Object to add Income/Expense to UI.
        addListItem: function(obj,type){
          var html,newHtml;
            if(type==='inc'){
                //Create Html with the placeholders
                element = DOMstrings.inputIncome;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }else if(type==='exp'){
                element = DOMstrings.inputExpenses;
                html ='<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            //Replace the Html placeHolders with the dynamic new values.
            newHtml = html.replace('%id%',obj.id); 
            newHtml = newHtml.replace('%description%',obj.description); 
            newHtml = newHtml.replace('%value%',formatNum(obj.value,type)); 
            //Insert the HTML in the UI.add new Item to UI.
                document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
        },
        
        clearFields:function(){
          var fields,fieldsArr;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function(current,index,Array){
                current.value ="";
            });
           fieldsArr[0].focus();
        },
        displayBudget : function(obj){
            if (obj.budget >0)
            {
                type ='inc';
            }
            else
            {
               type ='exp'; 
            }
            document.querySelector(DOMstrings.outputBudget).textContent = formatNum(obj.budget,type);
            document.querySelector(DOMstrings.outpuIncome).textContent = formatNum(obj.incomeTotal,'inc') ;
            document.querySelector(DOMstrings.outpuExpenses).textContent = formatNum(obj.expenseTotal,'exp') ;
            if(obj.percentage > 0)
            {
                document.querySelector(DOMstrings.outputPercentage).textContent = obj.percentage + '%';
            }else{
                document.querySelector(DOMstrings.outputPercentage).textContent = '---';
            }
        },
        displayPercentage:function(percentage){
            var fields;
                fields = document.querySelectorAll(DOMstrings.expPercentage);
                NodeArry(fields,function(current,index){
                    if(percentage[index]>0){
                        current.textContent = percentage[index] + '%';
                    }else{
                        current.textContent ='---';
                    }
                    
                });
                
        },
        deleteBudgetUI : function(itemId){
            var elem;
             elem = document.getElementById(itemId);
             elem.parentNode.removeChild(elem);
        },
        displayDate: function(){
          var now,month,months,year;
            now = new Date();
            year = now.getFullYear();
            month = now.getMonth();
            months= ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            document.querySelector(DOMstrings.month).textContent = months[month] + ' ' + year;
        },
        changedType: function(){
          var fields;
            fields = document.querySelectorAll(DOMstrings.inputType +','+
                                              DOMstrings.inputDescription + ','+
                                              DOMstrings.inputValue);
            NodeArry(fields,function(cur){
                cur.classList.toggle('red-focus');
            });
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },

        getDOMStrings: function(){
            return DOMstrings;
        }
        

        
    }
})();


var controller = (function(budgetCtrl, UICtrl){
    
    var setupEventListners = function(){
        var DOM = UICtrl.getDOMStrings();
        document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);
    
        document.addEventListener('keypress',function(event){
        if(event.keyCode ===13 || event.which === 13){
            ctrlAddItem();
        }
    }); 
        document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change',UICtrl.changedType);
        
    }
    function updateBudget(){
        //Update the Budget
        budgetCtrl.calculateBudget();
        
        //Return the Budget
       var budget =  budgetCtrl.getBudget();
       // console.log(budgetAll);
        //Display the Budget in UI
        UICtrl.displayBudget(budget);
        
    };
    function updatePercentages(){
        var percentages;
        //calculate budget percentage
        budgetController.calculatePercentage();
        //get Percentage
       percentages =  budgetController.getPercentage();
        //Display Percentage in UI
        UICtrl.displayPercentage(percentages);
        //console.log(percentages);
    };
    var ctrlAddItem =  function (){
      var input,newItem;
        input = UICtrl.getInputs()
        if(input.description !=="" && !isNaN(input.value) && input.value > 0){
            //create a New inc/exp Item.
            newItem = budgetCtrl.createNewItem(input.type,input.description,input.value);
            //Add expense/Income to UI
            UICtrl.addListItem(newItem,input.type);
            //Clear the fields
            UICtrl.clearFields();
            updateBudget();
            //calc percentages
            updatePercentages();
        };

    }
    var ctrlDeleteItem = function(event){
    var splitId,ID,type,itemId,
       itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemId){
            splitId = itemId.split('-');
            type = splitId[0];
            ID = parseInt(splitId[1]);

            //Call BudgetController to delete the item.
            budgetCtrl.deleteBudgetItem(type,ID);
            //call update the UI after deleting.
            UICtrl.deleteBudgetUI(itemId);
            //calculate and update the budget.
            updateBudget();
            updatePercentages();
        }
    }
 
    return{
        init: function(){
            console.log('Application Has started');
            UICtrl.displayDate();
             setupEventListners();
            UICtrl.displayBudget({
                 percentage : 0,
            budget : 0,
            incomeTotal :0,
            expenseTotal :0
            });
            
        }
        
    }
})(budgetController,UIController);

controller.init();