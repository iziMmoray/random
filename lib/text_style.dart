
import 'package:flutter/material.dart';

/// Personalise widget for textstyle 
class StyleText extends StatelessWidget{
   const StyleText (this.text, {super.key});

  /// Permet de creer une variable qui pourra en gros; 
  /// au lieuu de retourner le meme text retourner different selon different context
  /// 
  final String text;

  @override
  Widget build (BuildContext context){
    return  Text(text,
     style: const TextStyle(fontSize: 15),
    );
  }
}