import 'package:flutter/material.dart';
import 'package:random_number/text_style.dart';

///variable
///
const startAlignment = Alignment.topLeft;
const  endAlignement = Alignment.bottomRight;


class GradientContainer extends StatelessWidget{
   const GradientContainer ({super.key});
  
  @override
  Widget build(BuildContext context){
    return Scaffold(
      body:Container(
        decoration:  const  BoxDecoration(
          gradient: LinearGradient(colors: [ Color.fromRGBO(147, 165, 207, 1), Color.fromRGBO(228, 239, 233, 1)], 
          begin: startAlignment,
          end:  endAlignement)
        ),
        child: Center(
          child: StyleText("Hello woerld")),
      )
      
    );
  }
}